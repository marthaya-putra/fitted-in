import { z } from "zod";
import { createJob } from "@loctax/nest-pg-boss";

export const PDF_JOB_NAME = "generate-pdf";

export const pdfJobSchema = z.object({
  dbRowId: z.string(),
  markdown: z.string(),
});

export type PdfJobData = z.infer<typeof pdfJobSchema>;

export const PdfJob = createJob<PdfJobData>(PDF_JOB_NAME);
