import { Injectable } from "@nestjs/common";
import { SummaryOptimizerService } from "./summary-optimizer.service";
import { WorkExperienceOptimizerService } from "./work-experience-optimizer.service";
import { SkillsOptimizerService } from "./skills-optimizer.service";
import { ResumeService } from "./resume.service";
import { JobDescriptionSummarizerService } from "./job-description-summarizer.service";
import { ResumeFormatterService } from "./resume-formatter.service";
import { ResumeProfile } from "../../db/types";
import type { UIMessageStreamWriter } from "ai";

export interface OptimizeResumeParams {
  userId: string;
  jobDescription: string;
  writer: UIMessageStreamWriter;
}

export interface OptimizedResume {
  summary: string;
  experiences: string;
  projects: string;
  skills: string;
}

@Injectable()
export class ResumeOptimizerService {
  constructor(
    private readonly jobDescriptionSummarizerService: JobDescriptionSummarizerService,
    private readonly summaryOptimizerService: SummaryOptimizerService,
    private readonly workExperienceOptimizerService: WorkExperienceOptimizerService,
    private readonly skillsOptimizerService: SkillsOptimizerService,
    private readonly resumeService: ResumeService,
    private readonly resumeFormatterService: ResumeFormatterService
  ) {}

  async streamOptimizedCV({
    userId,
    jobDescription,
    writer,
  }: OptimizeResumeParams) {
    const savedResume = await this.resumeService.findByUserId(userId);
    if (!savedResume) {
      throw new Error("Master resume not found");
    }

    writer.write({
      type: "data-status",
      data: {
        type: "status",
        stage: "summarizing",
        message: "Summarizing job description...",
        status: "in-progress",
      },
    });

    const summarizedJobDescription =
      await this.jobDescriptionSummarizerService.summarize(jobDescription);

    writer.write({
      type: "data-status",
      data: {
        type: "status",
        stage: "summarizing",
        message: "Job description summarized",
        status: "done",
      },
    });

    const [optimizedSummary, optimizedWorkExperiences, optimizedSkills] =
      await Promise.all([
        (async () => {
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "summary",
              message: "Optimizing summary...",
              status: "in-progress",
            },
          });
          const result = await this.summaryOptimizerService.optimize({
            jobDescription: summarizedJobDescription,
            summary: savedResume.summary!,
            experiences: savedResume.workExperiences!,
            educations: savedResume.educations!,
            skills: savedResume.skills!,
            projects: savedResume.projects || "",
          });
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "summary",
              message: "Summary optimized",
              status: "done",
            },
          });
          return result;
        })(),
        (async () => {
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "experience",
              message: "Optimizing work experience...",
              status: "in-progress",
            },
          });
          const result = await this.workExperienceOptimizerService.optimize({
            jobDescription: summarizedJobDescription,
            experiences: savedResume.workExperiences!,
            skills: savedResume.skills!,
          });
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "experience",
              message: "Work experience optimized",
              status: "done",
            },
          });
          return result;
        })(),
        (async () => {
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "skills",
              message: "Optimizing skills...",
              status: "in-progress",
            },
          });
          const result = await this.skillsOptimizerService.optimize({
            jobDescription: summarizedJobDescription,
            skills: savedResume.skills!,
            projects: savedResume.projects || "",
          });
          writer.write({
            type: "data-status",
            data: {
              type: "status",
              stage: "skills",
              message: "Skills optimized",
              status: "done",
            },
          });
          return result;
        })(),
      ]);

    const optimizedResume: ResumeProfile = {
      ...savedResume,
      summary: optimizedSummary,
      workExperiences: optimizedWorkExperiences,
      projects: savedResume.projects,
      skills: optimizedSkills,
    };

    writer.write({
      type: "data-status",
      data: {
        type: "status",
        stage: "formatting",
        message: "Formatting resume...",
        status: "in-progress",
      },
    });

    const formatterStream = this.resumeFormatterService.streamFormattedResume({
      resumeProfile: optimizedResume,
    });

    writer.merge(formatterStream.toUIMessageStream());

    writer.write({
      type: "data-status",
      data: {
        type: "status",
        stage: "formatting",
        message: "Resume formatted",
        status: "done",
      },
    });
  }
}
