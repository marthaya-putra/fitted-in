import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import { DRIZZLE_DB } from "../drizzle/drizzle.module";
import { type Db } from "../db/types";

export type PgBossJobState =
  | "created"
  | "retry"
  | "active"
  | "completed"
  | "cancelled"
  | "expired"
  | "failed";

/**
 * Thin wrapper around pg-boss job state queries for the generate-pdf queue.
 *
 * Queries the `pgboss.job` table directly via Drizzle instead of injecting the
 * raw PGBoss instance, avoiding ESM/CJS interop token issues.
 */
@Injectable()
export class PdfJobStatusService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  /** Return the pg-boss state for a job, or null if not found / deleted. */
  async getState(jobId: string): Promise<PgBossJobState | null> {
    const [row] = await this.db
      .execute<{ state: PgBossJobState }>(
        sql`SELECT state FROM pgboss.job WHERE id = ${jobId} LIMIT 1`
      );
    return row?.state ?? null;
  }
}
