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
} from "@nestjs/common";
import { ResumeService } from "../services/resume.service";
import { CreateResumeDto } from "../dto/create-resume.dto";
import { UpdateResumeDto } from "../dto/update-resume.dto";
import { ResumeProfile } from "@/db/schema";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ResumeParserService,
  ResumeData,
} from "../services/resume-parser.service";
import { CustomizeDto } from "../dto/customize-job.dto";
import { ResumeOptimizerService } from "../services/resume-optimizer.service";

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
    @Body(ValidationPipe) createResumeDto: CreateResumeDto
  ): Promise<ResumeProfile> {
    return await this.resumeService.create(createResumeDto);
  }

  @Get(":id")
  async findById(
    @Param("id", ParseIntPipe) id: number
  ): Promise<ResumeProfile> {
    return await this.resumeService.findById(id);
  }

  @Get("account/:accountId")
  async findByAccountId(
    @Param("accountId", ParseIntPipe) accountId: number
  ): Promise<ResumeProfile> {
    return await this.resumeService.findByAccountId(accountId);
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
    @UploadedFile() pdf: Express.Multer.File,
    @Body("accountId") accountId: string
  ): Promise<ResumeData> {
    try {
      // TODO: Use accountId for authentication/authorization if needed
      const result = await this.resumeParserService.parse(pdf);
      return result;
    } catch (error) {
      throw new Error("Failed to parse resume");
    }
  }

  @Post("optimize")
  @HttpCode(HttpStatus.OK)
  async optimize(@Body(ValidationPipe) customizeDto: CustomizeDto) {
    try {
      return this.resumeOptimizerService.optimize({
        jobDescription: customizeDto.jobDescription,
      });
    } catch (error) {
      throw new Error("Failed to customize job description");
    }
  }
}
