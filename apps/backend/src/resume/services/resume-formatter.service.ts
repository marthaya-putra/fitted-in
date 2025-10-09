import { Injectable } from "@nestjs/common";
import { streamText } from "ai";
import { defaultModel } from "../models";
import { type ResumeProfile } from "../../db/types";

export interface FormatResumeParams {
  resumeProfile: ResumeProfile;
}

@Injectable()
export class ResumeFormatterService {
  async streamFormattedResume(params: FormatResumeParams) {
    const systemPrompt = `You are a professional CV formatter and optimization assistant. 
Your task is to take raw/plain text resumes and transform them into a clean, well-structured CV that is both ATS-compatible and optimized for AI-based hiring systems. 

Guidelines:  
1. Use a clear, minimal layout with consistent section headings (e.g., "Summary", "Experience", "Education", "Skills", "Projects").  
2. Ensure correct ordering: Summary → Skills → Experience → Education → Projects (if any).  
3. Use standard fonts and bullet points. No tables, images, columns, or graphics.  
4. Experience should be in reverse chronological order, each with:  
   - Job Title  
   - Company Name  
   - Location (optional if missing)  
   - Start & End Dates  
   - Achievements/responsibilities in bullet points (quantify results where possible).  
5. Skills should be listed in a keyword-rich, ATS-friendly way. Group them by category (e.g., Programming Languages, Frameworks, Tools).  
6. Do not invent experience or skills. Use only the information provided in the raw text.  
7. Rewrite sentences concisely and in a professional, action-oriented style.  
8. Ensure correct grammar, punctuation, and consistent tense.  
9. Avoid personal details that can bias hiring (age, marital status, photo, religion, etc.).  
10. Output the final CV in plain text or Markdown with clean formatting.  

Your final output should look like a polished resume suitable for job applications, passing ATS filters, and understandable by both recruiters and AI screeners.
`;

    return streamText({
      model: defaultModel,
      system: systemPrompt,
      prompt: `Here is the CV data. Please reformat it into a professional, ATS-friendly resume following the system guidelines:

<CV>
    <Personal-Info>
      <Name>
        ${params.resumeProfile.fullName}
      </Name>
      <Location> 
        ${params.resumeProfile.location}
      </Location>
      <Email>
        ${params.resumeProfile.email}
      </Email>
      <Phone>
        ${params.resumeProfile.phone}
      </Phone>
      <Website>
        ${params.resumeProfile.website}
      </Website>
    </Personal-Info>
  <Summary>
    ${params.resumeProfile.summary}
  </Summary>
  <Work-Experience>
    ${params.resumeProfile.workExperiences}
  </Work-Experience>
  <Education>
    ${params.resumeProfile.educations}
  </Education>
  <Skills>
    ${params.resumeProfile.skills} 
  </Skills>  
</CV>

Make sure the final version:

- Use **Markdown formatting**:
  - Full name as an "# H1" heading at the very top.  
  - Contact info under the name in plain text, separated by "|".  
  - Section titles as "## H2" (e.g., "## SUMMARY").  
  - Job titles in **bold**, companies in *italic*, and dates/locations in plain text.  
  - Achievements as bullet points with **bold metrics** (percentages, dollar values, user counts, etc.) highlighted.  

- Structure must include: SUMMARY, SKILLS, EXPERIENCE, EDUCATION, PROJECTS (if any).  
- Use bullet points for achievements and skills.  
- Make measurable results **stand out** (e.g., “Improved performance by **30%**”).  
- Keep it keyword-rich but truthful (do not invent).  
- Be concise, grammatically correct, and professional.  
- Output only the final resume in Markdown, no explanations.
`,
    });
  }
}
