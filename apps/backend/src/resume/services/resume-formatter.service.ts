import { Injectable } from "@nestjs/common";
import { streamText } from "ai";
import { getModel } from "../models";
import { type ResumeProfile } from "../../db/types";

export interface FormatResumeParams {
  resumeProfile: ResumeProfile;
}

@Injectable()
export class ResumeFormatterService {
  streamFormattedResume(params: FormatResumeParams) {
    try {
      const systemPrompt = `You are a professional CV formatter and optimization assistant.
Your task is to take raw/plain text resumes and transform them into a clean, well-structured CV that is both ATS-compatible and optimized for AI-based hiring systems.

Guidelines:
1. Use a clear, minimal layout with consistent section headings (e.g., "Summary", "Experience", "Education", "Skills", "Projects").
2. Ensure correct ordering: Summary → Experience → Skills → Education → Projects (if any).
3. Use standard fonts and bullet points. No tables, images, columns, or graphics.
4. Experience should be in reverse chronological order, each with:
   - Job Title
   - Company Name
   - Location (optional if missing)
   - Start & End Dates
   - CRITICAL: Company description (preserve any company information provided in raw text, format on a **separate new line**, in *italic*, directly below the dates/location)
   - Achievements/responsibilities in bullet points (quantify results where possible)
5. Skills should be formatted with bullet points for skill groups, not individual skills. Group them by category (e.g., Programming Languages, Frameworks, Tools). Each skill group should be one bullet point with the category name in bold followed by the skills listed after a colon.
6. Do not invent experience or skills. Use only the information provided in the raw text. IMPORTANT: Never remove or merge company descriptions — always preserve them verbatim.
7. Rewrite sentences concisely and in a professional, action-oriented style.
8. Ensure correct grammar, punctuation, and consistent tense.
9. Avoid personal details that can bias hiring (age, marital status, photo, religion, etc.).
10. Output the final CV in Markdown.

---

### CRITICAL FORMATTING RULE

For every work experience, you **must follow this exact Markdown layout**:

**Job Title** – *Company Name*  
Location, Start Date – End Date  
*Company description goes here on its own line*  
- Bullet 1  
- Bullet 2  
- Bullet 3  

✅ Requirements:
- The company description must always appear on its own line, *italicized*.
- Always include a blank line (or two trailing spaces) after the date line before the company description.
- Never merge company description with job title, company, or date.
- Never drop or paraphrase company descriptions.

Example:

**Senior Software Engineer** – *We Lysn*  
New South Wales, Australia (Remote), Feb 2024 – Present  
*Telehealth platform startup for mental health and workplace wellbeing*  
- Spearheaded development of a new telehealth platform MVP...
- Collaborated with product and design...
`;

      return streamText({
        model: getModel(),
        system: systemPrompt,
        prompt: `Here is the CV data. Please reformat it into a professional, ATS-friendly resume following the system guidelines:

<CV>
  <Personal-Info>
    <Name>${params.resumeProfile.fullName}</Name>
    <Location>${params.resumeProfile.location}</Location>
    <Email>${params.resumeProfile.email}</Email>
    <Phone>${params.resumeProfile.phone}</Phone>
    <Website>${params.resumeProfile.website}</Website>
  </Personal-Info>
  <Summary>${params.resumeProfile.summary}</Summary>
  <Work-Experience>${params.resumeProfile.workExperiences}</Work-Experience>
  <Education>${params.resumeProfile.educations}</Education>
  <Projects>${params.resumeProfile.projects}</Projects>
  <Skills>${params.resumeProfile.skills}</Skills>
</CV>

Make sure the final version:

- Uses **Markdown formatting**:
  - Full name as "# H1" heading at the top.
  - Contact info under the name, separated by "|".
  - Section titles as "## H2".
  - Job titles in **bold**, companies in *italic*, and dates/locations in plain text.
  - CRITICAL: Each company description must be preserved and appear on its own line, in *italic*, immediately below the location/date line.
  - Achievements as bullet points with **bold metrics** (percentages, counts, etc.) highlighted.
  - Skills section: Format skill groups as bullet points with category names in **bold** followed by a colon and skills listed (e.g., "- **Core Frontend Technologies**: JavaScript, TypeScript, React, Next.js").

- Structure: SUMMARY → EXPERIENCE → SKILLS → EDUCATION → PROJECTS
- Be concise, grammatically correct, and professional.
- Output only the final resume in Markdown, no explanations.
`,
        onError: err => {
          console.log("Error is happening...", JSON.stringify(err));
        },
      });
    } catch (error) {
      console.error("Error in ResumeFormatterService:", error);
      throw error;
    }
  }
}
