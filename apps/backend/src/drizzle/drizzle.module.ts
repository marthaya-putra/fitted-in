import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL is not configured');
        }
        const sql = postgres(connectionString, { max: 1 });
        return drizzle(sql, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DrizzleModule {}
