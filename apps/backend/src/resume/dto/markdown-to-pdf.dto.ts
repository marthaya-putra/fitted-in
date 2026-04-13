import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const markdownToPdfSchema = z.object({
  markdown: z.string().min(1, "Markdown content is required"),
});

export class MarkdownToPdfDto extends createZodDto(markdownToPdfSchema) {}
