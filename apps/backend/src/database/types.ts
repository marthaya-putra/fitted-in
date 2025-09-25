import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "../db/schema";

export type Db = ReturnType<typeof drizzle<typeof schema, Pool>>;