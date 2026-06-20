import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const dbPath = env.databaseUrl.replace("sqlite://", "").replace("file:", "") || "sqlite.db";
    const sqlite = new Database(dbPath);
    instance = drizzle(sqlite, { schema: fullSchema });
  }
  return instance;
}
