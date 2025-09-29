import { Module } from '@nestjs/common';
import { ResumeController } from './controllers/resume.controller';
import { ResumeService } from './services/resume.service';
import { ResumeParserService } from './services/resume-parser.service';
import { JobDescriptionSummarizerService } from './services/job-description-summarizer.service';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService, ResumeParserService, JobDescriptionSummarizerService],
  exports: [ResumeService, ResumeParserService, JobDescriptionSummarizerService],
})
export class ResumeModule {}
