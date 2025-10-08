import { Module, Global, DynamicModule } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { ResumeProfileRepository } from "./repositories/resume-profile.repository";
import { DB } from "./types";
import { schema } from "../db/schema";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: {
    connectionString: string;
    ssl?: boolean;
  }): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DB,
          useFactory: async () => {
            const pool = new Pool({
              connectionString: options.connectionString,
              ssl: options.ssl ?? false,
            });

            const connection = postgres(options.connectionString, {
              max: 1,
              ssl: options.ssl,
            });

            // Test connection
            await pool.query("SELECT 1");
            console.log("Database connection established successfully");

            return drizzle(pool, { schema });
          },
        },
        DatabaseService,
        ResumeProfileRepository,
      ],
      exports: [DB, DatabaseService, ResumeProfileRepository],
    };
  }
}
