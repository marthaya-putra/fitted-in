import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const updateResumeSchema = z.object({
  fullName: z.string().optional(),
  location: z.string().optional(),
  email: z.email("Invalid email format").optional(),
  website: z.url("Invalid URL format").optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  workExperiences: z.string().optional(),
  educations: z.string().optional(),
  skills: z.string().optional(),
  userId: z.string().optional(),
});

export class UpdateResumeDto extends createZodDto(updateResumeSchema) {}
