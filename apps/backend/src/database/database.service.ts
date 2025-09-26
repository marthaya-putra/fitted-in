import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Db, DB } from './types';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DB) private readonly database: Db) {}

  get db() {
    return this.database;
  }
}
