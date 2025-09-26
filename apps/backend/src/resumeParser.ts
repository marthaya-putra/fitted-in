import { generateObject } from 'ai';
import { resumeParserModel } from './models';
import { z } from 'zod';

const prompt = `Parse this resume and extract the information in a structured format. Please extract:
1. Personal information (full name, email, phone, location)
2. Professional summary
3. Work experiences
4. Education details
5. Technical skills

Return ALL attributes as raw markdown formatting with proper structure, bullet points, headings, and formatting where appropriate. Include markdown formatting for:
- Personal info: Use proper text formatting
- Summary: Use paragraphs and emphasis
- Experiences: Use bullet points, bold text for job titles, regular for companies, italic for company descriptions
- Education: Use bullet points, bold for degrees, italics for institutions
- Technical skills: Use categorized lists with proper markdown formatting`;

export const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().describe("The person's full name"),
    email: z.string().describe("The person's email address"),
    phone: z.string().describe("The person's phone number"),
    location: z.string().describe("The person's location/city"),
  }),
  resume: z.object({
    summary: z.string().describe('Professional summary or objective statement'),
    experiences: z
      .string()
      .describe(
        'Work experience details with job titles, companies, and dates'
      ),
    educations: z
      .string()
      .describe('Education history with degrees, institutions, and dates'),
    skills: z.string().describe('Skills and proficiencies'),
  }),
});

export type ResumeData = z.infer<typeof resumeSchema>;

export async function parse(pdfFile: Express.Multer.File): Promise<ResumeData> {
  try {
    // Convert buffer to Uint8Array for file input
    const fileData = new Uint8Array(pdfFile.buffer);

    // Generate structured data using AI with direct file input
    const { object } = await generateObject({
      model: resumeParserModel,
      system: prompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Parse this resume and extract the information in a structured format.',
            },
            {
              type: 'file',
              data: fileData,
              mediaType: 'application/pdf',
            },
          ],
        },
      ],
      schema: resumeSchema,
    });

    return object;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
}
