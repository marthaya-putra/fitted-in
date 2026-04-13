import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { mdToPdf } from "md-to-pdf";

@Injectable()
export class MarkdownToPdfService implements OnModuleDestroy {
  async generate(markdown: string): Promise<Buffer> {
    const pdf = await mdToPdf(
      { content: markdown },
      {
        pdf_options: {
          format: "A4",
          margin: { top: "1cm", bottom: "1cm", left: "1cm", right: "1cm" },
          printBackground: true,
        },
      }
    );

    if (!pdf) {
      throw new Error("Failed to generate PDF");
    }

    return pdf.content;
  }

  onModuleDestroy() {
    // md-to-pdf manages its own browser instance
    // Browser is closed automatically when the process exits
  }
}
