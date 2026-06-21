import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const dbUrl = env.databaseUrl || process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is missing");
    const pool = new Pool({
      connectionString: dbUrl,
    });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
