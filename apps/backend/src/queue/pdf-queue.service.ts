import { Injectable } from "@nestjs/common";
import type { JobService } from "@loctax/nest-pg-boss";

import { PdfJob, type PdfJobData } from "./pdf-job";

@Injectable()
export class PdfQueueService {
  constructor(
    @PdfJob.Inject() private readonly pdfJob: JobService<PdfJobData>
  ) {}

  /**
   * Enqueue a PDF generation job into pg-boss.
   *
   * `retryLimit: 2, retryDelay: 5` allows up to 2 attempts with a 5s
   * exponential backoff base.
   *
   * Returns the pg-boss job UUID (written into pdf_generation.job_id).
   */
  async addJob(dbRowId: string, markdown: string): Promise<string> {
    const jobId = await this.pdfJob.send(
      { dbRowId, markdown },
      { retryLimit: 2, retryDelay: 5, retryBackoff: true }
    );

    if (!jobId) {
      throw new Error("pg-boss did not return a job id for generate-pdf");
    }

    return jobId;
  }
}
