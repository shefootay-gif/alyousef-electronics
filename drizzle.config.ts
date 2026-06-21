import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Ocsg7AmCxP8N@ep-divine-pond-ascw5lgo.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});
