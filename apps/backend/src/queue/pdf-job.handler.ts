import { Inject, Injectable } from "@nestjs/common";
import type PGBoss from "pg-boss";
import { eq } from "drizzle-orm";

import { DRIZZLE_DB } from "../drizzle/drizzle.module";
import { type Db } from "../db/types";
import { pdfGeneration } from "../db/schema/pdf-generation.schema";
import { MarkdownToPdfService } from "../resume/services/markdown-to-pdf.service";
import { SupabaseStorageService } from "../resume/services/supabase-storage.service";
import { PdfJob, type PdfJobData } from "./pdf-job";

@Injectable()
export class PdfJobHandler {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly markdownToPdfService: MarkdownToPdfService,
    private readonly storageService: SupabaseStorageService
  ) {}

  // teamConcurrency: 1 pins "one Chromium-bound PDF at a time". teamSize stays
  // at its default of 1 (single-job mode), so exactly one PDF renders at once.
  @PdfJob.Handle({ teamConcurrency: 1 })
  async generate(job: PGBoss.Job<PdfJobData>): Promise<void> {
    const { dbRowId, markdown } = job.data;

    await this.db
      .update(pdfGeneration)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(pdfGeneration.id, dbRowId));

    try {
      const pdfBuffer = await this.markdownToPdfService.generate(markdown);
      const storagePath = `pdfs/${dbRowId}.pdf`;
      await this.storageService.upload(storagePath, pdfBuffer);
      const signedUrl = await this.storageService.getSignedUrl(storagePath);

      await this.db
        .update(pdfGeneration)
        .set({
          status: "completed",
          signedUrl,
          storagePath,
          updatedAt: new Date(),
        })
        .where(eq(pdfGeneration.id, dbRowId));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      await this.db
        .update(pdfGeneration)
        .set({
          status: "failed",
          errorMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(pdfGeneration.id, dbRowId));
      throw error;
    }
  }
}
