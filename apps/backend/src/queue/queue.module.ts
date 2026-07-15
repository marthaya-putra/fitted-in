import { Global, Module } from "@nestjs/common";
import { PGBossModule } from "@loctax/nest-pg-boss";
import { PdfQueueService } from "./pdf-queue.service";
import { PdfJobHandler } from "./pdf-job.handler";
import { PdfJob } from "./pdf-job";
import { PdfModule } from "../pdf/pdf.module";

@Global()
@Module({
  imports: [
    PdfModule,
    // Registers the JobService provider for the "generate-pdf" queue so
    // PdfQueueService can inject it via @PdfJob.Inject(). The global PGBossModule
    // (declared in app.module.ts) owns the PGBoss instance + worker lifecycle.
    PGBossModule.forJobs([PdfJob]),
  ],
  providers: [PdfQueueService, PdfJobHandler],
  exports: [PdfQueueService],
})
export class QueueModule {}
