import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, reviews, cartItems, orderItems, wishlistItems } from "@db/schema";
import { eq, and, like, gte, desc, asc, sql, inArray } from "drizzle-orm";

const ImageInput = z
  .string()
  .url("Must be a valid URL")
  .or(
    z
      .string()
      .regex(/^\/[\w./-]+$/, "Must be a valid URL or local public path")
      .refine((value) => !value.includes(".."), "Local image paths cannot traverse directories"),
  )
  .or(z.literal(""));

const MoneyInput = z.string().regex(/^\d+(\.\d{1,2})?$/);
const SlugInput = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const ListInput = z.object({
  categoryId: z.number().int().positive().optional(),
  brand: z.string().trim().max(80).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  rating: z.number().min(1).max(5).optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "name"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(60).default(12),
  status: z.enum(["active", "inactive", "draft", "out_of_stock"]).optional(),
  includeInactive: z.boolean().optional(),
});

export const productRouter = createRouter({
  list: publicQuery
    .input(ListInput)
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;

      const conditions = [];
      
      if (input.status) {
        conditions.push(eq(products.status, input.status));
      } else if (!(input.includeInactive && ctx.user?.role === "admin")) {
        conditions.push(eq(products.status, "active"));
      }

      if (input.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }

      if (input.brand) {
        conditions.push(eq(products.brand, input.brand));
      }

      if (input.minPrice !== undefined) {
        conditions.push(sql`${products.price}::numeric >= ${input.minPrice}`);
      }

      if (input.maxPrice !== undefined) {
        conditions.push(sql`${products.price}::numeric <= ${input.maxPrice}`);
      }

      if (input.rating) {
        conditions.push(gte(products.averageRating, input.rating.toString()));
      }

      if (input.search?.trim()) {
        conditions.push(like(products.name, `%${input.search.trim().slice(0, 120)}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Build order by
      let orderBy;
      switch (input.sort) {
        case "price_asc":
          orderBy = asc(sql`${products.price}::numeric`);
          break;
        case "price_desc":
          orderBy = desc(sql`${products.price}::numeric`);
          break;
        case "rating":
          orderBy = desc(products.averageRating);
          break;
        case "name":
          orderBy = asc(products.name);
          break;
        default:
          orderBy = desc(products.createdAt);
      }

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: products.id,
            name: products.name,
            nameAr: products.nameAr,
            slug: products.slug,
            description: products.description,
            descriptionAr: products.descriptionAr,
            shortDescription: products.shortDescription,
            categoryId: products.categoryId,
            brand: products.brand,
            sku: products.sku,
            price: products.price,
            salePrice: products.salePrice,
            image: products.image,
            stockQuantity: products.stockQuantity,
            status: products.status,
            isFeatured: products.isFeatured,
            averageRating: products.averageRating,
            reviewCount: products.reviewCount,
            crossSellIds: products.crossSellIds,
            upsellProductId: products.upsellProductId,
            createdAt: products.createdAt,
          })
          .from(products)
          .where(whereClause)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(whereClause),
      ]);

      const total = countResult[0]?.count || 0;

      // Get categories for the products
      const categoryIds = [...new Set(items.map(i => i.categoryId).filter(Boolean))];
      const categoryList = categoryIds.length > 0
        ? await db.select().from(categories).where(inArray(categories.id, categoryIds))
        : [];

      const itemsWithCategory = items.map(item => ({
        ...item,
        category: categoryList.find(c => c.id === item.categoryId) || null,
      }));

      return {
        items: itemsWithCategory,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: SlugInput }))
    .query(async ({ input }) => {
      const db = getDb();
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1);

      if (!product) return null;

      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1);

      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, product.id))
        .orderBy(desc(reviews.createdAt))
        .limit(10);

      return { ...product, category, reviews: productReviews };
    }),

  getByIds: publicQuery
    .input(z.object({ ids: z.array(z.number().int().positive()).max(100) }))
    .query(async ({ input }) => {
      if (!input.ids || input.ids.length === 0) return [];
      const db = getDb();
      const items = await db
        .select()
        .from(products)
        .where(inArray(products.id, input.ids));
      return items;
    }),

  getFeatured: publicQuery
    .input(z.object({ limit: z.number().int().min(1).max(24).default(8) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit || 8;
      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          shortDescription: products.shortDescription,
          categoryId: products.categoryId,
          brand: products.brand,
          price: products.price,
          salePrice: products.salePrice,
          image: products.image,
          stockQuantity: products.stockQuantity,
          status: products.status,
          averageRating: products.averageRating,
          reviewCount: products.reviewCount,
        })
        .from(products)
        .where(and(eq(products.isFeatured, true), eq(products.status, "active")))
        .orderBy(desc(products.createdAt))
        .limit(limit);
    }),

  getByCategory: publicQuery
    .input(z.object({ categorySlug: SlugInput, page: z.number().int().min(1).default(1), limit: z.number().int().min(1).max(60).default(12) }))
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, input.categorySlug))
        .limit(1);

      if (!category) return { items: [], total: 0, category: null };

      const [items, countResult] = await Promise.all([
        db
          .select({
            id: products.id,
            name: products.name,
            slug: products.slug,
            shortDescription: products.shortDescription,
            brand: products.brand,
            price: products.price,
            salePrice: products.salePrice,
            image: products.image,
            averageRating: products.averageRating,
            reviewCount: products.reviewCount,
          })
          .from(products)
          .where(and(eq(products.categoryId, category.id), eq(products.status, "active")))
          .orderBy(desc(products.createdAt))
          .limit(input.limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(and(eq(products.categoryId, category.id), eq(products.status, "active"))),
      ]);

      return { items, total: countResult[0]?.count || 0, category };
    }),

  search: publicQuery
    .input(z.object({ query: z.string().trim().min(1).max(120), limit: z.number().int().min(1).max(20).default(8) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          salePrice: products.salePrice,
          image: products.image,
          brand: products.brand,
        })
        .from(products)
        .where(
          and(
            like(products.name, `%${input.query.trim()}%`),
            eq(products.status, "active")
          )
        )
        .limit(input.limit);
    }),

  getFilters: publicQuery.query(async () => {
    const db = getDb();
    const [brandsResult, priceResult] = await Promise.all([
      db
        .select({ brand: products.brand })
        .from(products)
        .where(eq(products.status, "active"))
        .groupBy(products.brand),
      db
        .select({
          min: sql<string>`MIN(${products.price})`,
          max: sql<string>`MAX(${products.price})`,
        })
        .from(products)
        .where(eq(products.status, "active")),
    ]);

    return {
      brands: brandsResult.map(b => b.brand).filter(Boolean) as string[],
      priceRange: {
        min: Number(priceResult[0]?.min || 0),
        max: Number(priceResult[0]?.max || 10000),
      },
    };
  }),

  create: adminQuery
    .input(
      z.object({
        name: z.string().trim().min(1).max(180),
        nameAr: z.string().trim().max(180).optional().nullable(),
        slug: SlugInput,
        description: z.string().max(5_000).optional(),
        descriptionAr: z.string().max(5_000).optional().nullable(),
        shortDescription: z.string().max(500).optional(),
        categoryId: z.number().int().positive(),
        brand: z.string().trim().max(80).optional(),
        sku: z.string().trim().max(80).optional(),
        price: MoneyInput,
        salePrice: MoneyInput.optional().nullable(),
        image: ImageInput.optional(),
        stockQuantity: z.number().int().min(0).default(0),
        status: z.enum(["active", "inactive", "draft", "out_of_stock"]).default("draft"),
        isFeatured: z.boolean().default(false),
        upsellProductId: z.number().int().positive().nullable().optional(),
        crossSellIds: z.array(z.number().int().positive()).max(12).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [inserted] = await db.insert(products).values(input).returning({ id: products.id });
      return { id: inserted.id, ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().trim().min(1).max(180).optional(),
        nameAr: z.string().trim().max(180).optional().nullable(),
        slug: SlugInput.optional(),
        description: z.string().max(5_000).optional(),
        descriptionAr: z.string().max(5_000).optional().nullable(),
        shortDescription: z.string().max(500).optional(),
        categoryId: z.number().int().positive().optional(),
        brand: z.string().trim().max(80).optional(),
        sku: z.string().trim().max(80).optional(),
        price: MoneyInput.optional(),
        salePrice: MoneyInput.optional().nullable(),
        image: ImageInput.optional(),
        stockQuantity: z.number().int().min(0).optional(),
        status: z.enum(["active", "inactive", "draft", "out_of_stock"]).optional(),
        isFeatured: z.boolean().optional(),
        upsellProductId: z.number().int().positive().nullable().optional(),
        crossSellIds: z.array(z.number().int().positive()).max(12).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(products).set(data).where(eq(products.id, id));
      const [updated] = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return updated;
    }),

  delete: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [ordered] = await db
        .select({ count: sql<number>`count(*)` })
        .from(orderItems)
        .where(eq(orderItems.productId, input.id));

      if ((ordered?.count || 0) > 0) {
        await db
          .update(products)
          .set({ status: "inactive" })
          .where(eq(products.id, input.id));
        return { success: true, archived: true };
      }

      await db.delete(cartItems).where(eq(cartItems.productId, input.id));
      await db.delete(wishlistItems).where(eq(wishlistItems.productId, input.id));
      await db.delete(reviews).where(eq(reviews.productId, input.id));

      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  toggleStatus: adminQuery
    .input(z.object({ id: z.number().int().positive(), status: z.enum(["active", "inactive", "draft", "out_of_stock"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products).set({ status: input.status }).where(eq(products.id, input.id));
      const [updated] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      return updated;
    }),
});
