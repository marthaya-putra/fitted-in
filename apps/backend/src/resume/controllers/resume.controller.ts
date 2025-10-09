import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { type Response } from "express";
import {
  AllowAnonymous,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";

import { ResumeService } from "../services/resume.service";
import { CreateResumeDto } from "../dto/create-resume.dto";
import { UpdateResumeDto } from "../dto/update-resume.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ResumeParserService,
  ResumeData,
} from "../services/resume-parser.service";
import { CustomizeDto } from "../dto/customize-job.dto";
import { ResumeOptimizerService } from "../services/resume-optimizer.service";
import { ResumeProfile } from "../../db/types";

@Controller("resumes")
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly resumeParserService: ResumeParserService,
    private readonly resumeOptimizerService: ResumeOptimizerService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Session() session: UserSession,
    @Body(ValidationPipe) createResumeDto: CreateResumeDto
  ): Promise<ResumeProfile> {
    if (session.user.id !== createResumeDto.userId) {
      throw new UnauthorizedException();
    }
    return await this.resumeService.create(createResumeDto);
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

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body(ValidationPipe) updateResumeDto: UpdateResumeDto
  ): Promise<ResumeProfile> {
    return await this.resumeService.update(id, updateResumeDto);
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
    try {
      const result = await this.resumeParserService.parse(pdf);
      return result;
    } catch (error) {
      throw new Error("Failed to parse resume");
    }
  }

  @Post("optimize")
  @HttpCode(HttpStatus.OK)
  async optimize(@Body() customizeDto: CustomizeDto, @Res() res: Response) {
    const result = await this.resumeOptimizerService.streamOptimizedCV({
      jobDescription: customizeDto.jobDescription,
    });

    result.pipeTextStreamToResponse(res);
  }
}
