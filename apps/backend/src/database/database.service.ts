import { Injectable, OnModuleInit } from '@nestjs/common';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "../db/schema";
import { Db } from "./types";

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;
  private _db: Db;

  constructor() {
    // Don't initialize here - wait for OnModuleInit
  }

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test connection
    try {
      await this.pool.query('SELECT 1');
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }

    this._db = drizzle(this.pool, { schema });
  }

  get db() {
    if (!this._db) {
      throw new Error('Database not initialized');
    }
    return this._db;
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}