import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories } from "@db/schema";
import { eq, asc } from "drizzle-orm";

const SlugInput = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const categoryRouter = createRouter({
  list: publicQuery
    .input(z.object({ includeInactive: z.boolean().default(false) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const includeInactive = ctx.user?.role === "admin" && (input?.includeInactive || false);

      if (includeInactive) {
        return db.select().from(categories).orderBy(asc(categories.sortOrder));
      }

      return db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder));
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: SlugInput }))
    .query(async ({ input }) => {
      const db = getDb();
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.slug))
        .limit(1);
      return category || null;
    }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        slug: SlugInput,
        icon: z.string().max(80).optional(),
        description: z.string().max(1_000).optional(),
        sortOrder: z.number().int().min(0).max(10_000).default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [created] = await db.insert(categories).values(input).returning();
      return created;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(120).optional(),
        slug: SlugInput.optional(),
        icon: z.string().max(80).optional(),
        description: z.string().max(1_000).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(10_000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(categories).set(data).where(eq(categories.id, id));
      const [updated] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      return updated;
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
