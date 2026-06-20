import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const allSettings = await db.select().from(siteSettings);
    const result: Record<string, any> = {};
    for (const setting of allSettings) {
      result[setting.key] = setting.value;
    }
    return result;
  }),

  getContactLinks: publicQuery.query(async () => {
    const db = getDb();
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "contactLinks"))
      .limit(1);
    return (setting?.value as any) || { whatsapp: "", website: "", snapchat: "", twitter: "", telegram: "" };
  }),

  update: adminQuery
    .input(z.object({ key: z.string(), value: z.any() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, input.key))
        .limit(1);

      if (existing) {
        await db
          .update(siteSettings)
          .set({ value: input.value })
          .where(eq(siteSettings.key, input.key));
      } else {
        await db.insert(siteSettings).values({ key: input.key, value: input.value });
      }

      return { success: true };
    }),

  bulkUpdate: adminQuery
    .input(z.record(z.string(), z.any()))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const [key, value] of Object.entries(input)) {
        const [existing] = await db
          .select()
          .from(siteSettings)
          .where(eq(siteSettings.key, key))
          .limit(1);

        if (existing) {
          await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
        } else {
          await db.insert(siteSettings).values({ key, value });
        }
      }
      return { success: true };
    }),
});
