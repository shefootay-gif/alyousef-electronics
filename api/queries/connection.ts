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
    const dbUrl = env.databaseUrl || "postgresql://neondb_owner:npg_Ocsg7AmCxP8N@ep-divine-pond-ascw5lgo.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    const pool = new Pool({
      connectionString: dbUrl,
    });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}
