import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import { defaultModel } from "../models";

export interface OptimizeSummaryParams {
  jobDescription: string;
  summary: string;
  experiences: string;
  educations: string;
  skills: string;
}

const systemPrompt = `You are an expert CV/Resume optimization assistant specializing in Applicant Tracking Systems (ATS) and AI resume screening.
Your task is to rewrite or generate the "Summary" section of a CV so that it:

Aligns with the job description provided, emphasizing the most relevant skills, experiences, and achievements.

Is ATS-friendly:

Use clear, direct, professional language.

Incorporate keywords from the job description naturally.

Avoid graphics, tables, special formatting, or uncommon symbols.

Highlights value and impact:

Showcase years of experience, technical and soft skills, and notable results.

Demonstrate alignment with the company’s industry, role, and expectations.

Maintains a concise, professional tone:

3–5 sentences or bullet points.

No fluff, buzzwords without context, or vague claims.

Avoid first-person pronouns (“I,” “my”) — write in an objective CV tone.

Is future-focused:

Present the candidate as ready to succeed in this new role.

Connect past achievements to potential contributions in the target position.

Output format:
Return only the rewritten CV Summary section, formatted as plain text, with no additional commentary or explanation.

IMPORTANT: DO NOT MAKE THIS UP!!! IF THE RESUME DON'T CONTAIN REQUIRED SKILLS OR EXPERIENCES, DO NOT ADD THEM`;

@Injectable()
export class SummaryOptimizerService {
  async optimize(params: OptimizeSummaryParams): Promise<string> {
    const { text } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      prompt: `Optimize CV Summary section with data provided below:
      <job-description>
      ${params.jobDescription}
      </job-description>
      <resume>
        <existing-summary>
        ${params.summary}
        </existing-summary>
        <work-experiences>
        ${params.experiences}
        </work-experiences>
        <educations>
        ${params.educations}
        </educations>
        <skills>
        ${params.skills}
        </skills>
      </resume>
      `,
    });
    return text;
  }
}
