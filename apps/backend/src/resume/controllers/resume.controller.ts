import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
  Sse,
  UnauthorizedException,
  Inject,
  UseGuards,
} from "@nestjs/common";
import { type Response } from "express";
import { randomBytes, createHash } from "node:crypto";
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";
import { map, type Observable, switchMap, takeWhile, timer } from "rxjs";
import { PdfStatusTokenGuard } from "../guards/pdf-status-token.guard";

import { ResumeService } from "../services/resume.service";
import { resumeDto } from "../dto/create-resume.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ResumeParserService,
  ResumeData,
} from "../services/resume-parser.service";
import { CustomizeDto } from "../dto/customize-job.dto";
import { ResumeOptimizerService } from "../services/resume-optimizer.service";
import { ResumeProfile } from "../../db/types";
import { createUIMessageStream, pipeUIMessageStreamToResponse } from "ai";
import { MarkdownToPdfDto } from "../dto/markdown-to-pdf.dto";
import { PdfGenerationRepository } from "../../repositories/pdf-generation.repository";
import { PdfQueueService } from "../../queue/pdf-queue.service";
import { PdfJobStatusService } from "../../queue/pdf-job-status.service";
import { DRIZZLE_DB } from "../../drizzle/drizzle.module";
import { type Db } from "../../db/types";
import { pdfGeneration } from "../../db/schema/pdf-generation.schema";
import { eq } from "drizzle-orm";

@Controller("resumes")
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumeParserService: ResumeParserService,
    private readonly resumeOptimizerService: ResumeOptimizerService,
    private readonly pdfGenerationRepo: PdfGenerationRepository,
    private readonly pdfQueueService: PdfQueueService,
    private readonly pdfJobStatus: PdfJobStatusService,
    @Inject(DRIZZLE_DB) private readonly db: Db
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async save(
    @Session() session: UserSession,
    @Body() createResumeDto: resumeDto
  ): Promise<ResumeProfile | null> {
    if (session.user.id !== createResumeDto.userId) {
      throw new UnauthorizedException();
    }
    return await this.resumeService.save(createResumeDto);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<ResumeProfile> {
    return await this.resumeService.findById(id);
  }

  @Get("user/:userId")
  async findByUserId(
    @Session() session: UserSession
  ): Promise<ResumeProfile | null> {
    return this.resumeService.findByUserId(session.user.id);
  }

  @Post("parse")
  @UseInterceptors(
    FileInterceptor("pdf", {
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== "application/pdf") {
          return callback(new Error("Only PDF files are allowed"), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  async parseResume(
    @UploadedFile() pdf: Express.Multer.File
  ): Promise<ResumeData> {
    return this.resumeParserService.parse(pdf);
  }

  @Post("pdf")
  @HttpCode(HttpStatus.OK)
  async enqueuePdfGeneration(@Body() dto: MarkdownToPdfDto) {
    // Capability token: returned to the authenticated caller only, used by the
    // (public) SSE status endpoint. Stored as a SHA-256 hash so the DB leak
    // wouldn't grant status access.
    const statusToken = randomBytes(32).toString("hex");
    const statusTokenHash = createHash("sha256")
      .update(statusToken)
      .digest("hex");

    const dbRow = await this.pdfGenerationRepo.create(this.db, {
      jobId: "",
      status: "pending",
      statusTokenHash,
    });

    const jobId = await this.pdfQueueService.addJob(dbRow.id, dto.markdown);

    await this.db
      .update(pdfGeneration)
      .set({ jobId })
      .where(eq(pdfGeneration.id, dbRow.id));

    return { id: dbRow.id, jobId, statusToken };
  }

  @Sse("pdf/status/:id")
  @AllowAnonymous()
  @UseGuards(PdfStatusTokenGuard)
  pdfStatusStream(@Param("id") id: string): Observable<MessageEvent> {
    // Auth is handled by PdfStatusTokenGuard (which must run as a guard, not an
    // in-handler check — see the guard's docstring for why SSE routes can't
    // surface HTTP errors once the stream has started).
    return timer(0, 2000).pipe(
      switchMap(async () => {
        try {
          const row = await this.pdfGenerationRepo.findById(this.db, id);
          if (!row) return { data: { status: "not_found" } };

          // When the row is still in-flight, ask pg-boss what it thinks.
          // This catches cases where the worker died and pg-boss expired
          // the job but never ran the handler that would update the row.
          if (row.status === "pending" || row.status === "processing") {
            const bossState = await this.pdfJobStatus.getState(row.jobId);

            // Terminal states that mean the job will never succeed. `expired`
            // is the one pg-boss uses when the worker dies mid-job.
            if (
              bossState === "failed" ||
              bossState === "cancelled" ||
              bossState === "expired"
            ) {
              const reason = `Job ${bossState} in pg-boss`;
              await this.db
                .update(pdfGeneration)
                .set({ status: "failed", errorMessage: reason, updatedAt: new Date() })
                .where(eq(pdfGeneration.id, id));

              return {
                data: { status: "failed", errorMessage: reason },
              };
            }

            // pg-boss `completed` while the row is still in-flight: the handler
            // has finished but hasn't written the row yet. Fall through and let
            // the next poll read the reconciled row (don't emit `completed`
            // without a `signedUrl`).
          }

          return {
            data: {
              status: row.status,
              signedUrl: row.signedUrl,
              errorMessage: row.errorMessage,
            },
          };
        } catch {
          return { data: { status: "error" } };
        }
      }),
      map(payload => ({ data: JSON.stringify(payload.data) }) as MessageEvent),
      takeWhile(ev => {
        const data = JSON.parse(ev.data as string) as { status: string };
        return (
          data.status !== "completed" &&
          data.status !== "failed" &&
          data.status !== "not_found"
        );
      }, true)
    );
  }

  @Post("optimize")
  @HttpCode(HttpStatus.OK)
  optimize(
    @Session() session: UserSession,
    @Body() customizeDto: CustomizeDto,
    @Res() res: Response
  ) {
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        await this.resumeOptimizerService.streamOptimizedCV({
          userId: session.user.id,
          jobDescription: customizeDto.jobDescription,
          writer,
        });
      },
    });

    return pipeUIMessageStreamToResponse({ stream, response: res });
  }
}
