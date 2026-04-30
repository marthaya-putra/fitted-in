import { Global, Module } from "@nestjs/common";
import { PdfQueueService } from "./pdf-queue.service";
import { PdfModule } from "../pdf/pdf.module";

@Global()
@Module({
  imports: [PdfModule],
  providers: [PdfQueueService],
  exports: [PdfQueueService],
})
export class QueueModule {}
