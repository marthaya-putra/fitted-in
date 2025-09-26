import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse, ResumeData } from './resumeParser';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('parse-resume')
  @UseInterceptors(
    FileInterceptor('pdf', {
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(new Error('Only PDF files are allowed'), false);
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
    @Body('accountId') accountId: string
  ): Promise<ResumeData> {
    try {
      // TODO: Use accountId for authentication/authorization if needed
      const result = await parse(pdf);
      return result;
    } catch (error) {
      throw new Error('Failed to parse resume');
    }
  }
}
