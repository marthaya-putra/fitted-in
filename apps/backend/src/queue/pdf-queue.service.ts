import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Worker, type Job, type Processor } from "bullmq";
import { DRIZZLE_DB } from "../drizzle/drizzle.module";
import { type Db } from "../db/types";
import { pdfGeneration } from "../db/schema/pdf-generation.schema";
import { eq } from "drizzle-orm";
import { MarkdownToPdfService } from "../resume/services/markdown-to-pdf.service";
import { SupabaseStorageService } from "../resume/services/supabase-storage.service";

export const PDF_QUEUE_NAME = "pdf-generation";

interface PdfJobData {
  dbRowId: string;
  markdown: string;
}

@Injectable()
export class PdfQueueService implements OnModuleDestroy {
  private queue: Queue<PdfJobData, { signedUrl: string }>;
  private worker: Worker<PdfJobData>;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly markdownToPdfService: MarkdownToPdfService,
    private readonly storageService: SupabaseStorageService
  ) {
    const connection = {
      url: this.configService.get<string>("REDIS_URL")!,
    };

    this.queue = new Queue(PDF_QUEUE_NAME, { connection });

    this.worker = new Worker<PdfJobData>(PDF_QUEUE_NAME, this.processor(), {
      connection,
      autorun: false,
    });

    this.worker.on("failed", (job: Job<PdfJobData> | undefined, err: Error) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });

    this.worker.on("completed", () => {
      void this.queue
        .getJobCounts("waiting", "active", "delayed")
        .then(counts => {
          const pending = counts.waiting + counts.active + counts.delayed;
          if (pending === 0) void this.stop();
        });
    });
  }

  private processor(): Processor<PdfJobData> {
    return async (job: Job<PdfJobData>) => {
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

        return { signedUrl };
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
    };
  }

  async start(): Promise<void> {
    if (this.worker.isRunning()) return;
    await this.worker.run();
  }

  async stop(): Promise<void> {
    if (!this.worker.isRunning()) return;
    await this.worker.pause();
  }

  async addJob(dbRowId: string, markdown: string): Promise<string> {
    await this.start();
    const job = await this.queue.add(
      "generate-pdf",
      { dbRowId, markdown } satisfies PdfJobData,
      {
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
      }
    );
    return job.id!;
  }

  async onModuleDestroy() {
    await this.queue.close();
    await this.worker.close();
  }
}
