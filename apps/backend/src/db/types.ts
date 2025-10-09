import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { schema } from '.';

export type Db = PostgresJsDatabase<typeof schema>;

export type ResumeProfile = typeof schema.resumeProfile.$inferSelect;
export type NewResumeProfile = typeof schema.resumeProfile.$inferInsert;
