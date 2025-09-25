import { resumeProfile, type ResumeProfile, type NewResumeProfile } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { Db } from "../types";

export class ResumeProfileRepository {

  async create(db: Db, data: Omit<NewResumeProfile, "id">): Promise<ResumeProfile> {
    const [newProfile] = await db.insert(resumeProfile).values(data).returning();
    return newProfile;
  }

  async findById(db: Db, id: number): Promise<ResumeProfile | null> {
    const [profile] = await db.select().from(resumeProfile).where(eq(resumeProfile.id, id));
    return profile || null;
  }

  async findByAccountId(db: Db, accountId: number): Promise<ResumeProfile | null> {
    const [profile] = await db.select().from(resumeProfile).where(eq(resumeProfile.accountId, accountId));
    return profile || null;
  }

  async findAll(db: Db): Promise<ResumeProfile[]> {
    return await db.select().from(resumeProfile);
  }

  async update(db: Db, id: number, data: Partial<Omit<NewResumeProfile, "id">>): Promise<ResumeProfile | null> {
    const [updatedProfile] = await db
      .update(resumeProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resumeProfile.id, id))
      .returning();
    return updatedProfile || null;
  }

  async delete(db: Db, id: number): Promise<boolean> {
    const [deletedProfile] = await db
      .delete(resumeProfile)
      .where(eq(resumeProfile.id, id))
      .returning();
    return !!deletedProfile;
  }

  async deleteByAccountId(db: Db, accountId: number): Promise<boolean> {
    const [deletedProfile] = await db
      .delete(resumeProfile)
      .where(eq(resumeProfile.accountId, accountId))
      .returning();
    return !!deletedProfile;
  }
}