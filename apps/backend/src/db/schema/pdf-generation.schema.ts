import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pdfGeneration = pgTable("pdf_generation", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: text("job_id").notNull().unique(),
  status: text({ enum: ["pending", "processing", "completed", "failed"] })
    .notNull()
    .default("pending"),
  signedUrl: text("signed_url"),
  storagePath: text("storage_path"),
  errorMessage: text("error_message"),
  // SHA-256 hash of the capability token that gates the public SSE status
  // endpoint. Raw token is returned only to the authenticated enqueue caller.
  statusTokenHash: text("status_token_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
