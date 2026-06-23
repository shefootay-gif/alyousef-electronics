import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const settings = await db.select().from(siteSettings);
    
    // Transform into a simple key-value object
    const result: Record<string, any> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    
    // Default values if not found
    if (!result["siteName"]) result["siteName"] = "AL-YOUSEF Electronics";
    if (!result["primaryColor"]) result["primaryColor"] = "#D4AF37";
    if (!result["secondaryColor"]) result["secondaryColor"] = "#0F172A";
    
    return result;
  }),
  
  update: adminQuery
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      for (const [key, value] of Object.entries(input)) {
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
        if (existing.length > 0) {
          await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
        } else {
          await db.insert(siteSettings).values({ key, value });
        }
      }
      
      return { success: true };
    })
});
