import { Injectable } from "@nestjs/common";
import { SummaryOptimizerService } from "./summary-optimizer.service";
import { WorkExperienceOptimizerService } from "./work-experience-optimizer.service";
import { SkillsOptimizerService } from "./skills-optimizer.service";
import { ResumeService } from "./resume.service";
import { JobDescriptionSummarizerService } from "./job-description-summarizer.service";

export interface OptimizeResumeParams {
  jobDescription: string;
}

export interface OptimizedResume {
  summary: string;
  experiences: string;
  skills: string;
}

@Injectable()
export class ResumeOptimizerService {
  constructor(
    private readonly jobDescriptionSummarizerService: JobDescriptionSummarizerService,
    private readonly summaryOptimizerService: SummaryOptimizerService,
    private readonly workExperienceOptimizerService: WorkExperienceOptimizerService,
    private readonly skillsOptimizerService: SkillsOptimizerService,
    private readonly resumeService: ResumeService
  ) {}

  async optimize(params: OptimizeResumeParams): Promise<OptimizedResume> {
    const savedResume = await this.resumeService.findById(3);
    if (!savedResume) {
      throw new Error("Master resume not found");
    }

    const summarizedJobDescription =
      await this.jobDescriptionSummarizerService.summarize(
        params.jobDescription
      );

    const [optimizedSummary, optimizedWorkExperiences, optimizedSkills] =
      await Promise.all([
        this.summaryOptimizerService.optimize({
          jobDescription: summarizedJobDescription,
          summary: savedResume.summary,
          experiences: savedResume.workExperiences,
          educations: savedResume.educations,
          skills: savedResume.skills,
        }),
        this.workExperienceOptimizerService.optimize({
          jobDescription: summarizedJobDescription,
          experiences: savedResume.workExperiences,
          skills: savedResume.skills,
        }),
        this.skillsOptimizerService.optimize({
          jobDescription: summarizedJobDescription,
          skills: savedResume.skills,
        }),
      ]);

    return {
      summary: optimizedSummary,
      experiences: optimizedWorkExperiences,
      skills: optimizedSkills,
    };
  }
}
