import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { OcrService } from "../../resume/services/ocr.service";
import { z } from "zod";

@Controller("jobs")
export class JobsController {
  constructor(private readonly ocrService: OcrService) {}

  @Post("extract")
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      fileFilter: (_req, file, callback) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
          return callback(
            new Error("Only JPEG, PNG, WebP images allowed"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    })
  )
  async extractJobDescription(
    @UploadedFiles() images: Express.Multer.File[]
  ): Promise<{ text: string }> {
    const jobDescriptionSchema = z.object({
      text: z.string().describe("Full job description text from the image"),
    });
    return await this.ocrService.extract(images, {
      schema: jobDescriptionSchema,
      userMessage:
        "Extract the complete job description from this job posting image.",
    });
  }
}
