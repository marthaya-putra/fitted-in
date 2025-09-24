CREATE TABLE "resume_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"location" text,
	"email" text,
	"website" text,
	"phone" text,
	"summary" text,
	"work_experiences" text,
	"educations" text,
	"technical_skills" text,
	"account_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
