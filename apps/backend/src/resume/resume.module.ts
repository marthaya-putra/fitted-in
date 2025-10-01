import { Module } from "@nestjs/common";
import { ResumeController } from "./controllers/resume.controller";
import { ResumeService } from "./services/resume.service";
import { ResumeParserService } from "./services/resume-parser.service";
import { JobDescriptionSummarizerService } from "./services/job-description-summarizer.service";
import { SummaryOptimizerService } from "./services/summary-optimizer.service";
import { ResumeOptimizerService } from "./services/resume-optimizer.service";
import { WorkExperienceOptimizerService } from "./services/work-experience-optimizer.service";
import { SkillsOptimizerService } from "./services/skills-optimizer.service";

@Module({
  controllers: [ResumeController],
  providers: [
    ResumeService,
    ResumeParserService,
    JobDescriptionSummarizerService,
    SummaryOptimizerService,
    WorkExperienceOptimizerService,
    SkillsOptimizerService,
    ResumeOptimizerService,
  ],
  exports: [
    ResumeService,
    ResumeParserService,
    JobDescriptionSummarizerService,
    SummaryOptimizerService,
    WorkExperienceOptimizerService,
    SkillsOptimizerService,
    ResumeOptimizerService,
  ],
})
export class ResumeModule {}
