import { Injectable } from "@nestjs/common";
import { generateObject } from "ai";
import { ocrModel } from "../models";
import type { ZodSchema } from "zod";

interface OcrOptions {
  schema: ZodSchema;
  prompt?: string;
  userMessage?: string;
}

@Injectable()
export class OcrService {
  async extract<T>(
    files: Express.Multer.File[],
    options: OcrOptions
  ): Promise<T> {
    const content = [
      {
        type: "text" as const,
        text: options.userMessage ?? "Extract all text from this file.",
      },
      ...files.map((f) => ({
        type: "file" as const,
        data: new Uint8Array(f.buffer),
        mediaType: f.mimetype,
      })),
    ];

    const { object } = await generateObject({
      model: ocrModel,
      system: options.prompt,
      schema: options.schema,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    });
    return object as T;
  }
}
