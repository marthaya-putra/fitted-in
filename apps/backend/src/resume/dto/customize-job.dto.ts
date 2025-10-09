import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const customizeJobSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required'),
});

export class CustomizeDto extends createZodDto(customizeJobSchema) {}
