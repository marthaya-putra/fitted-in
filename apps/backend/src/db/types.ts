import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema } from "../db/schema";

export type Db = PostgresJsDatabase<typeof schema>;
