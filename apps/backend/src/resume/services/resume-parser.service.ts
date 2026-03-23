import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { OcrService } from "./ocr.service";

const prompt = `Parse this resume and extract the information in a structured format. Please extract:
1. Personal information (full name, email, phone, location)
2. Professional summary
3. Work experiences
4. Education details
5. Technical skills

Return ALL attributes as plain text without any markdown formatting. Use simple text formatting only:
- Personal info: Use plain text with basic line breaks
- Summary: Use plain text paragraphs
- Experiences: Use plain text with basic line breaks and simple formatting
- Education: Use plain text with basic line breaks
- Technical skills: Use plain text lists with simple line breaks

DO NOT use markdown formatting, headings, bullet points with asterisks, bold text, italics, or any other markdown syntax.`;

export const resumeSchema = z.object({
  fullName: z.string().describe("The person's full name"),
  email: z.string().describe("The person's email address"),
  phone: z.string().describe("The person's phone number"),
  location: z.string().describe("The person's location/city"),
  summary: z.string().describe("Professional summary or objective statement"),
  workExperiences: z
    .string()
    .describe("Work experience details with job titles, companies, and dates"),
  educations: z
    .string()
    .describe("Education history with degrees, institutions, and dates"),
  skills: z.string().describe("Skills and proficiencies"),
});

export type ResumeData = z.infer<typeof resumeSchema>;

@Injectable()
export class ResumeParserService {
  constructor(private readonly ocrService: OcrService) {}

  async parse(pdfFile: Express.Multer.File): Promise<ResumeData> {
    try {
      return await this.ocrService.extract([pdfFile], {
        schema: resumeSchema,
        prompt,
        userMessage:
          "Parse this resume and extract the information in a structured format.",
      });
    } catch (error) {
      console.error("Error parsing resume:", error);
      throw new Error("Failed to parse resume");
    }
  }
}
