import { Module, Global, DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ResumeProfileRepository } from './repositories/resume-profile.repository';
import { DB } from './types';

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
            const { Pool } = await import('pg');
            const { drizzle } = await import('drizzle-orm/node-postgres');
            const { schema } = await import('../db/schema');

            const pool = new Pool({
              connectionString: options.connectionString,
              ssl: options.ssl ?? false,
            });

            // Test connection
            await pool.query('SELECT 1');
            console.log('Database connection established successfully');

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