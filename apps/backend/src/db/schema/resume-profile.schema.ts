import { pgTable, serial, text, timestamp, text as pgText } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const resumeProfile = pgTable("resume_profile", {
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

  userId: pgText("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});