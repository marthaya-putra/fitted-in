import { Injectable } from "@nestjs/common";
import { generateText } from "ai";
import { defaultModel } from "../models";
import { type ResumeProfile } from "../../db/schema";

export interface FormatResumeParams {
  resumeProfile: ResumeProfile;
}

@Injectable()
export class ResumeFormatterService {
  async format(params: FormatResumeParams): Promise<string> {
    const systemPrompt = `You are an expert resume formatter specializing in creating ATS-friendly and LLM-optimized resumes that maintain formatting when copied to Google Docs.

Your task is to format the provided resume content with the following requirements:

1. ATS Optimization:
- Use clean, standard formatting with clear headings
- Incorporate relevant keywords naturally
- Avoid graphics, tables, or special symbols
- Use standard bullet points (• or -)
- Maintain consistent structure

2. Google Docs Compatibility:
- Use standard HTML tags that Google Docs preserves: <h1>, <h2>, <h3>, <strong>, <em>, <ul>, <li>, <p>, <br>
- Avoid complex CSS or styling
- Use semantic HTML structure
- Ensure proper heading hierarchy

3. LLM Friendly:
- Clear, professional language
- Well-structured content
- Proper spacing and readability
- Consistent formatting patterns

Format Structure:
- Use <h1> for name
- Use <h2> for major sections (Summary, Experience, Education, Skills)
- Use <h3> for job titles and company names
- Use <strong> for emphasis on key achievements
- Use <em> for subtle emphasis
- Use <ul> and <li> for bullet points
- Use <p> for paragraphs
- Use <br> for line breaks when needed

Output Format:
Return ONLY the HTML version (for Google Docs compatibility). Do not include any labels, explanations, or plain text versions.

Important: Do not invent or add information that isn't present in the original resume. Only format and optimize the existing content.`;

    const { text } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      prompt: `Format the following resume data for ATS optimization and Google Docs compatibility:

Resume Data:
- Name: ${params.resumeProfile.fullName}
- Location: ${params.resumeProfile.location || "N/A"}
- Email: ${params.resumeProfile.email || "N/A"}
- Phone: ${params.resumeProfile.phone || "N/A"}
- Website: ${params.resumeProfile.website || "N/A"}

Summary:
${params.resumeProfile.summary || "N/A"}

Work Experience:
${params.resumeProfile.workExperiences || "N/A"}

Education:
${params.resumeProfile.educations || "N/A"}

Skills:
${params.resumeProfile.skills || "N/A"}

Please format this resume following the requirements in the system prompt. Return only the HTML version without any labels or explanations.`,
    });

    return text;
  }
}
