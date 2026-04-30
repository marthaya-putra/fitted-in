CREATE TABLE "pdf_generation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"signed_url" text,
	"storage_path" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pdf_generation_job_id_unique" UNIQUE("job_id")
);
