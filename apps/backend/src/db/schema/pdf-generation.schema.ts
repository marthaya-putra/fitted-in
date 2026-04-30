import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pdfGeneration = pgTable("pdf_generation", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: text("job_id").notNull().unique(),
  status: text("status").notNull().default("pending"),
  signedUrl: text("signed_url"),
  storagePath: text("storage_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
