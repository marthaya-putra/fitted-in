import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { marked, type Token, type Tokens } from "marked";

const CM_TO_PT = 28.35;

const HEADING_SIZES: Record<number, number> = {
  1: 23,
  2: 17,
  3: 16,
  4: 14,
  5: 12,
  6: 11,
};

@Injectable()
export class MarkdownToPdfService {
  async generate(markdown: string): Promise<Buffer> {
    const tokens = marked.lexer(markdown);

    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: CM_TO_PT,
        bottom: CM_TO_PT,
        left: CM_TO_PT,
        right: CM_TO_PT,
      },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    const promise = new Promise<Buffer>(resolve => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    for (const token of tokens) {
      this.renderToken(doc, token);
    }

    doc.end();
    return promise;
  }

  private renderToken(doc: PDFKit.PDFDocument, token: Token): void {
    switch (token.type) {
      case "heading":
        this.renderHeading(doc, token as Tokens.Heading);
        break;
      case "paragraph":
        this.renderParagraph(doc, token as Tokens.Paragraph);
        break;
      case "list":
        this.renderList(doc, token as Tokens.List);
        break;
      case "code":
        this.renderCode(doc, token as Tokens.Code);
        break;
      case "blockquote":
        this.renderBlockquote(doc, token as Tokens.Blockquote);
        break;
      case "hr":
        doc.moveDown(0.5);
        doc
          .strokeColor("#cccccc")
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .stroke();
        doc.moveDown(0.5);
        break;
      case "space":
        break;
    }
  }

  private renderHeading(doc: PDFKit.PDFDocument, token: Tokens.Heading): void {
    const size = HEADING_SIZES[token.depth] ?? 12;
    doc.font("Helvetica-Bold").fontSize(size);
    this.renderInlineTokens(doc, token.tokens);
    doc.moveDown(0.3);
  }

  private renderParagraph(
    doc: PDFKit.PDFDocument,
    token: Tokens.Paragraph
  ): void {
    doc.font("Helvetica").fontSize(11);
    this.renderInlineTokens(doc, token.tokens);
    doc.moveDown(0.5);
  }

  private renderInlineTokens(doc: PDFKit.PDFDocument, tokens?: Token[]): void {
    if (!tokens) return;

    for (const token of tokens) {
      switch (token.type) {
        case "text": {
          const t = token as Tokens.Text;
          doc.fillColor("#000000").text(t.text, { continued: false });
          break;
        }
        case "strong": {
          const t = token as Tokens.Strong;
          doc.font("Helvetica-Bold").fillColor("#000000");
          for (const child of t.tokens) {
            doc.text((child as Tokens.Text).text, { continued: false });
          }
          doc.font("Helvetica");
          break;
        }
        case "em": {
          const t = token as Tokens.Em;
          doc.font("Helvetica-Oblique").fillColor("#000000");
          for (const child of t.tokens) {
            doc.text((child as Tokens.Text).text, { continued: false });
          }
          doc.font("Helvetica");
          break;
        }
        case "codespan": {
          const t = token as Tokens.Codespan;
          doc
            .font("Courier")
            .fontSize(10)
            .fillColor("#333333")
            .text(t.text, { continued: false });
          doc.font("Helvetica").fontSize(11).fillColor("#000000");
          break;
        }
        default: {
          const t = token as Tokens.Generic;
          if (t.text) {
            doc.text(t.text, { continued: false });
          }
        }
      }
    }
  }

  private renderList(doc: PDFKit.PDFDocument, token: Tokens.List): void {
    const items = token.items;
    items.forEach((item, i) => {
      const prefix = token.ordered ? `${Number(token.start ?? 1) + i}. ` : "• ";
      doc.font("Helvetica").fontSize(11).fillColor("#000000");
      doc.text(prefix + item.text, { indent: 10 });
    });
    doc.moveDown(0.3);
  }

  private renderCode(doc: PDFKit.PDFDocument, token: Tokens.Code): void {
    const lineHeight = 14;
    const padding = 8;
    const lines = token.text.split("\n");
    const boxHeight = lines.length * lineHeight + padding * 2;

    doc
      .rect(doc.x, doc.y, doc.page.width - CM_TO_PT * 2, boxHeight)
      .fill("#f5f5f5");

    doc.fillColor("#333333").font("Courier").fontSize(10);
    for (const line of lines) {
      doc.text(line, doc.x, doc.y + padding, {
        lineGap: 4,
      });
    }
    doc.fillColor("#000000").font("Helvetica").fontSize(11);
    doc.moveDown(0.5);
  }

  private renderBlockquote(
    doc: PDFKit.PDFDocument,
    token: Tokens.Blockquote
  ): void {
    const x = doc.x;
    doc.rect(x, doc.y, 3, 20).fill("#cccccc");
    doc.x = x + 10;
    doc.font("Helvetica-Oblique").fontSize(11).fillColor("#555555");
    for (const t of token.tokens) {
      if (t.type === "paragraph") {
        this.renderInlineTokens(doc, (t as Tokens.Paragraph).tokens);
      }
    }
    doc.x = x;
    doc.font("Helvetica").fillColor("#000000");
    doc.moveDown(0.5);
  }
}
