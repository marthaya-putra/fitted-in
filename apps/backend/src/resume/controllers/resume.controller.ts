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
} from "@nestjs/common";
import { type Response } from "express";
import {
  Session,
  type UserSession,
  AllowAnonymous,
} from "@thallesp/nestjs-better-auth";
import { type Observable, Subject } from "rxjs";

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
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  async enqueuePdfGeneration(@Body() dto: MarkdownToPdfDto) {
    const dbRow = await this.pdfGenerationRepo.create(this.db, {
      jobId: "",
      status: "pending",
    });

    const jobId = await this.pdfQueueService.addJob(dbRow.id, dto.markdown);

    await this.db
      .update(pdfGeneration)
      .set({ jobId })
      .where(eq(pdfGeneration.id, dbRow.id));

    return { id: dbRow.id, jobId };
  }

  @Get("pdf/status/:id")
  @AllowAnonymous()
  @Sse()
  pdfStatusStream(@Param("id") id: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();

    const poll = async () => {
      try {
        const row = await this.pdfGenerationRepo.findById(this.db, id);

        if (!row) {
          subject.next({
            data: JSON.stringify({ status: "not_found" }),
          } as MessageEvent);
          subject.complete();
          return;
        }

        subject.next({
          data: JSON.stringify({
            status: row.status,
            signedUrl: row.signedUrl,
            errorMessage: row.errorMessage,
          }),
        } as MessageEvent);

        if (row.status === "completed" || row.status === "failed") {
          subject.complete();
          return;
        }

        setTimeout(poll, 2000);
      } catch {
        subject.next({
          data: JSON.stringify({ status: "error" }),
        } as MessageEvent);
        subject.complete();
      }
    };

    subject.next({
      data: JSON.stringify({ status: "pending" }),
    } as MessageEvent);
    poll();

    return subject.asObservable();
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
