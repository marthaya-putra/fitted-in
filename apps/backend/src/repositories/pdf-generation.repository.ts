import {
  type Db,
  type NewPdfGeneration,
  type PdfGeneration,
} from "../db/types";
import { pdfGeneration } from "../db/schema/pdf-generation.schema";
import { eq } from "drizzle-orm";

export class PdfGenerationRepository {
  async create(
    db: Db,
    data: Omit<NewPdfGeneration, "id">
  ): Promise<PdfGeneration> {
    const [row] = await db.insert(pdfGeneration).values(data).returning();
    return row;
  }

  async findById(db: Db, id: string): Promise<PdfGeneration> {
    const [row] = await db
      .select()
      .from(pdfGeneration)
      .where(eq(pdfGeneration.id, id));
    return row || null;
  }
}
