import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "../db/schema";

export type Db = NodePgDatabase<typeof schema>;

export const DB = Symbol('DB');
