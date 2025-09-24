import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { resumeProfile, type ResumeProfile, type NewResumeProfile } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class ResumeProfileRepository {
  constructor(private readonly databaseService: DatabaseService) { }

  async create(data: Omit<NewResumeProfile, "id">): Promise<ResumeProfile> {
    const [newProfile] = await this.databaseService.db.insert(resumeProfile).values(data).returning();
    return newProfile;
  }

  async findById(id: number): Promise<ResumeProfile | null> {
    console.log("process.env.DATABASE_URL: ", process.env.DATABASE_URL)
    const [profile] = await this.databaseService.db.select().from(resumeProfile).where(eq(resumeProfile.id, id));
    return profile || null;
  }

  async findByAccountId(accountId: number): Promise<ResumeProfile | null> {
    try {
      console.log('Executing query with accountId:', accountId);
      console.log('DATABASE_URL:', process.env.DATABASE_URL);

      // Test basic connection first
      const testResult = await this.databaseService.db.select({ count: sql`count(*)` }).from(resumeProfile);
      console.log('Table count test:', testResult);

      const [profile] = await this.databaseService.db.select().from(resumeProfile).where(eq(resumeProfile.accountId, accountId));
      console.log('Query result:', profile);
      return profile || null;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }

  async findAll(): Promise<ResumeProfile[]> {
    return await this.databaseService.db.select().from(resumeProfile);
  }

  async update(id: number, data: Partial<Omit<NewResumeProfile, "id">>): Promise<ResumeProfile | null> {
    const [updatedProfile] = await this.databaseService.db
      .update(resumeProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resumeProfile.id, id))
      .returning();
    return updatedProfile || null;
  }

  async delete(id: number): Promise<boolean> {
    const [deletedProfile] = await this.databaseService.db
      .delete(resumeProfile)
      .where(eq(resumeProfile.id, id))
      .returning();
    return !!deletedProfile;
  }

  async deleteByAccountId(accountId: number): Promise<boolean> {
    const [deletedProfile] = await this.databaseService.db
      .delete(resumeProfile)
      .where(eq(resumeProfile.accountId, accountId))
      .returning();
    return !!deletedProfile;
  }
}