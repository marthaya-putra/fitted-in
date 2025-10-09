import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const resumeSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Full name is required"),
  location: z.string().optional(),
  email: z.email("Invalid email format").optional(),
  website: z.url("Invalid URL format").optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  workExperiences: z.string().optional(),
  educations: z.string().optional(),
  skills: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
});

export class resumeDto extends createZodDto(resumeSchema) {}
