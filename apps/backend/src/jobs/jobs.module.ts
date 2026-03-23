import { Module } from "@nestjs/common";
import { JobsController } from "./controllers/jobs.controller";
import { OcrService } from "../resume/services/ocr.service";

@Module({
  controllers: [JobsController],
  providers: [OcrService],
  exports: [OcrService],
})
export class JobsModule {}
