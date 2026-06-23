import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { apiKeys, siteSettings } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as crypto from "node:crypto";
import { defaultSiteSettings, mergeSiteSettings, pruneEmptyStrings, type SiteSettings } from "@contracts/site-settings";

const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const optionalText = (schema: z.ZodString) => z.preprocess(emptyToUndefined, schema.optional());

const ContactLinksSchema = z.object({
  whatsapp: optionalText(z.string().trim().max(30)),
  website: optionalText(z.string().trim().url()),
  snapchat: optionalText(z.string().trim().max(200)),
  twitter: optionalText(z.string().trim().max(200)),
  telegram: optionalText(z.string().trim().max(200)),
});

const TrackingPixelsSchema = z.object({
  facebookPixelId: optionalText(z.string().trim().regex(/^[0-9]{5,30}$/)),
  tiktokPixelId: optionalText(z.string().trim().regex(/^[a-zA-Z0-9]{8,64}$/)),
  snapchatPixelId: optionalText(z.string().trim().regex(/^[a-zA-Z0-9_-]{8,64}$/)),
  googleAnalyticsId: optionalText(z.string().trim().regex(/^(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+)$/)),
});

const LocalizedTextSchema = z.object({
  en: optionalText(z.string().trim().max(2000)),
  ar: optionalText(z.string().trim().max(2000)),
});

const SiteContentSchema = z.object({
  tagline: optionalText(z.string().trim().max(80)),
  logoTagline: optionalText(z.string().trim().max(120)),
  bannerText: LocalizedTextSchema.optional(),
  heroEyebrow: LocalizedTextSchema.optional(),
  heroTitle: LocalizedTextSchema.optional(),
  heroDescription: LocalizedTextSchema.optional(),
  heroImage: optionalText(z.string().trim().max(500000)),
  offerTitle: LocalizedTextSchema.optional(),
  offerCode: optionalText(z.string().trim().max(80)),
  footerDescription: LocalizedTextSchema.optional(),
  supportEmail: optionalText(z.string().trim().email()),
  aboutTitle: LocalizedTextSchema.optional(),
  aboutDescription: LocalizedTextSchema.optional(),
  aboutImage: optionalText(z.string().trim().max(500000)),
  services: z
    .array(
      z.object({
        title: LocalizedTextSchema,
        description: LocalizedTextSchema,
      }),
    )
    .max(8)
    .optional(),
});

const StoreSettingsSchema = z.object({
  siteName: z.string().trim().min(2).max(80).optional(),
  logoUrl: optionalText(z.string().trim().max(500000)),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  currency: z.literal("EGP").optional(),
  themePreset: z.enum(["luxury", "clean", "contrast"]).optional(),
  heroStyle: z.enum(["image", "minimal", "spotlight"]).optional(),
  contactLinks: ContactLinksSchema.optional(),
  trackingPixels: TrackingPixelsSchema.optional(),
  content: SiteContentSchema.optional(),
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

    const result: Partial<SiteSettings> = {};
    for (const setting of settings) {
      result[setting.key as keyof SiteSettings] = setting.value as never;
    }

    return mergeSiteSettings(result);
  }),

  getContactLinks: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "contactLinks"))
      .limit(1);

    return mergeSiteSettings({ contactLinks: (rows[0]?.value ?? {}) as SiteSettings["contactLinks"] }).contactLinks;
  }),
  
  update: adminQuery
    .input(StoreSettingsSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      const cleaned = pruneEmptyStrings(input);
      const normalized = mergeSiteSettings(cleaned);
      const allowedKeys = Object.keys(defaultSiteSettings) as (keyof SiteSettings)[];

      for (const key of allowedKeys) {
        const value = normalized[key];
        if (value === undefined) continue;
        await db
          .insert(siteSettings)
          .values({ key, value })
          .onConflictDoUpdate({
            target: siteSettings.key,
            set: { value },
          });
      }

      return { success: true, settings: normalized };
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
