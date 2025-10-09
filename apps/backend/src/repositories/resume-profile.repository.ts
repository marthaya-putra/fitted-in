import { Db, NewResumeProfile, ResumeProfile } from "../db/types";
import { resumeProfile } from "../db/schema/resume-profile.schema";
import { eq } from "drizzle-orm";

export class ResumeProfileRepository {
  async create(
    db: Db,
    data: Omit<NewResumeProfile, "id">
  ): Promise<ResumeProfile> {
    const [newProfile] = await db
      .insert(resumeProfile)
      .values(data)
      .returning();
    return newProfile;
  }

  async findById(db: Db, id: number): Promise<ResumeProfile | null> {
    const [profile] = await db
      .select()
      .from(resumeProfile)
      .where(eq(resumeProfile.id, id));
    return profile || null;
  }

  async findByUserId(
    db: Db,
    userId: string
  ): Promise<ResumeProfile | null> {
    const [profile] = await db
      .select()
      .from(resumeProfile)
      .where(eq(resumeProfile.userId, userId));
    return profile || null;
  }

  async findAll(db: Db): Promise<ResumeProfile[]> {
    return await db.select().from(resumeProfile);
  }

  async update(
    db: Db,
    id: number,
    data: Partial<Omit<NewResumeProfile, "id">>
  ): Promise<ResumeProfile | null> {
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

  async deleteByUserId(db: Db, userId: string): Promise<boolean> {
    const [deletedProfile] = await db
      .delete(resumeProfile)
      .where(eq(resumeProfile.userId, userId))
      .returning();
    return !!deletedProfile;
  }
}
