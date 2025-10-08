import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const schema = {
  resumeProfile: pgTable("resume_profile", {
    id: serial("id").primaryKey(),

    // personal info
    fullName: text("full_name").notNull(),
    location: text("location"),
    email: text("email"),
    website: text("website"),
    phone: text("phone"),

    // resume info
    summary: text("summary"),
    workExperiences: text("work_experiences"),
    educations: text("educations"),
    skills: text("skills"),

    accountId: integer("account_id").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }),
};

export const resumeProfile = schema.resumeProfile;

export type ResumeProfile = typeof resumeProfile.$inferSelect;
export type NewResumeProfile = typeof resumeProfile.$inferInsert;

export * from "./auth-schema";
