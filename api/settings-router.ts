import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apiKeys, siteSettings } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as crypto from "node:crypto";

const ContactLinksSchema = z.object({
  whatsapp: z.string().trim().regex(/^\+?[0-9]{8,15}$/).optional(),
  website: z.string().trim().url().optional(),
  snapchat: z.string().trim().max(80).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  twitter: z.string().trim().max(80).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
  telegram: z.string().trim().max(80).regex(/^[a-zA-Z0-9_]+$/).optional(),
});

const TrackingPixelsSchema = z.object({
  facebookPixelId: z.string().trim().regex(/^[0-9]{5,30}$/).optional(),
  tiktokPixelId: z.string().trim().regex(/^[a-zA-Z0-9]{8,64}$/).optional(),
  snapchatPixelId: z.string().trim().regex(/^[a-zA-Z0-9_-]{8,64}$/).optional(),
  googleAnalyticsId: z.string().trim().regex(/^(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+)$/).optional(),
});

const StoreSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  currency: z.literal("EGP").optional(),
  themePreset: z.enum(["luxury", "clean", "contrast"]).optional(),
  heroStyle: z.enum(["image", "minimal", "spotlight"]).optional(),
  contactLinks: ContactLinksSchema.optional(),
  trackingPixels: TrackingPixelsSchema.optional(),
});

function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

function toIntegrationListItem<T extends { key: string; keyHash?: string | null; keyPrefix?: string | null }>(row: T) {
  return {
    ...row,
    key: row.keyHash ? `${row.keyPrefix || row.key.slice(0, 10)}...` : `${row.key.slice(0, 10)}...`,
    keyHash: null,
  };
}

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
    if (!result["accentColor"]) result["accentColor"] = "#0099CC";
    if (!result["currency"]) result["currency"] = "EGP";
    if (!result["themePreset"]) result["themePreset"] = "luxury";
    if (!result["heroStyle"]) result["heroStyle"] = "image";
    if (!result["contactLinks"]) result["contactLinks"] = {};
    if (!result["trackingPixels"]) result["trackingPixels"] = {};
    
    return result;
  }),

  getContactLinks: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "contactLinks"))
      .limit(1);

    return (rows[0]?.value ?? {}) as {
      whatsapp?: string;
      website?: string;
      snapchat?: string;
      twitter?: string;
      telegram?: string;
    };
  }),
  
  update: adminQuery
    .input(StoreSettingsSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      
      for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
        if (existing.length > 0) {
          await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key));
        } else {
          await db.insert(siteSettings).values({ key, value });
        }
      }
      
      return { success: true };
    }),

  listDropshippingIntegrations: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
    return rows.map(toIntegrationListItem);
  }),

  createDropshippingIntegration: adminQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(80),
        provider: z.enum(["zendrop", "aliexpress", "cj_dropshipping", "dsers", "custom"]),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const key = `ay_${nanoid(40)}`;
      const keyPrefix = key.slice(0, 10);
      const [inserted] = await db
        .insert(apiKeys)
        .values({
          name: input.name,
          provider: input.provider,
          key: keyPrefix,
          keyHash: hashApiKey(key),
          keyPrefix,
          isActive: true,
        })
        .returning();

      return { ...inserted, key, keyHash: null };
    }),

  toggleDropshippingIntegration: adminQuery
    .input(z.object({ id: z.number().int().positive(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [updated] = await db
        .update(apiKeys)
        .set({ isActive: input.isActive })
        .where(eq(apiKeys.id, input.id))
        .returning();
      return updated;
    }),

  deleteDropshippingIntegration: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(apiKeys).where(eq(apiKeys.id, input.id));
      return { success: true };
    }),
});
