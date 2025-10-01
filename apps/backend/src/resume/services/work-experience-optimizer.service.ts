import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import { defaultModel } from "../models";

export interface OptimizeWorkExperienceParams {
  jobDescription: string;
  resume: {
    summary: string;
    experiences: string;
    educations: string;
    skills: string;
  };
}

const systemPrompt = `You are an expert CV/Resume optimization assistant specializing in Applicant Tracking Systems (ATS) and AI resume screening.
Your task is to optimize the "Work Experience" section of a CV so that it:

Aligns with the job description provided, emphasizing the most relevant skills, experiences, and achievements.

Is ATS-friendly:

Use clear, direct, professional language.

Incorporate keywords from the job description naturally.

Avoid graphics, tables, special formatting, or uncommon symbols.

Highlights value and impact:

Showcase quantifiable achievements and results where possible.

Emphasize technical skills and experiences that match the job requirements.

Demonstrate alignment with the company's industry, role, and expectations.

Maintains a professional and consistent format:

Keep the existing structure and chronology.

Use strong action verbs to start bullet points.

Be specific about technologies, tools, and methodologies used.

Focus on achievements rather than responsibilities.

Important guidelines:

DO NOT invent or fabricate experiences, skills, or achievements.
Only optimize and rephrase what already exists in the resume.
Do not add new technologies or experiences not mentioned in the original resume.
Do not exaggerate or misrepresent the candidate's background.

Output format:
Return only the optimized Work Experience section, formatted as plain text with the same structure as the input (company names, dates, positions, bullet points).

IMPORTANT: DO NOT MAKE THIS UP!!! IF THE RESUME DON'T CONTAIN REQUIRED SKILLS OR EXPERIENCES, DO NOT ADD THEM. ONLY OPTIMIZE THE EXISTING CONTENT.`;

@Injectable()
export class WorkExperienceOptimizerService {
  async optimizeWorkExperience(params: OptimizeWorkExperienceParams): Promise<string> {
    const { text } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      prompt: `Optimize CV Work Experience section with data provided below:
      <job-description>
      ${params.jobDescription}
      </job-description>
      <resume>
        <existing-experiences>
        ${params.resume.experiences}
        </existing-experiences>
        <summary>
        ${params.resume.summary}
        </summary>
        <educations>
        ${params.resume.educations}
        </educations>
        <skills>
        ${params.resume.skills}
        </skills>
      </resume>
      `,
    });
    return text;
  }
}