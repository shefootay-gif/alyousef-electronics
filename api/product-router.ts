import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories, reviews } from "@db/schema";
import { eq, and, like, gte, lte, desc, asc, sql, inArray } from "drizzle-orm";

const ListInput = z.object({
  categoryId: z.number().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  rating: z.number().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "name"]).optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
  status: z.enum(["active", "inactive", "draft", "out_of_stock"]).optional(),
});

export const productRouter = createRouter({
  list: publicQuery
    .input(ListInput)
    .query(async ({ input }) => {
      const db = getDb();
      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;

      const conditions = [];
      
      if (input.status) {
        conditions.push(eq(products.status, input.status));
      } else {
        conditions.push(eq(products.status, "active"));
      }

      if (input.categoryId) {
        conditions.push(eq(products.categoryId, input.categoryId));
      }

      if (input.brand) {
        conditions.push(eq(products.brand, input.brand));
      }

      if (input.minPrice !== undefined) {
        conditions.push(gte(products.price, input.minPrice.toString()));
      }

      if (input.maxPrice !== undefined) {
        conditions.push(lte(products.price, input.maxPrice.toString()));
      }

      if (input.rating) {
        conditions.push(gte(products.averageRating, input.rating.toString()));
      }

      if (input.search) {
        conditions.push(like(products.name, `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Build order by
      let orderBy;
      switch (input.sort) {
        case "price_asc":
          orderBy = asc(products.price);
          break;
        case "price_desc":
          orderBy = desc(products.price);
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
            shortDescription: products.shortDescription,
            categoryId: products.categoryId,
            brand: products.brand,
            price: products.price,
            salePrice: products.salePrice,
            image: products.image,
            stockQuantity: products.stockQuantity,
            status: products.status,
            isFeatured: products.isFeatured,
            averageRating: products.averageRating,
            reviewCount: products.reviewCount,
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
    .input(z.object({ slug: z.string() }))
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

  getFeatured: publicQuery
    .input(z.object({ limit: z.number().default(8) }).optional())
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
    .input(z.object({ categorySlug: z.string(), page: z.number().default(1), limit: z.number().default(12) }))
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
    .input(z.object({ query: z.string(), limit: z.number().default(8) }))
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
            like(products.name, `%${input.query}%`),
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
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number(),
        brand: z.string().optional(),
        sku: z.string().optional(),
        price: z.string(),
        salePrice: z.string().optional(),
        image: z.string().optional(),
        stockQuantity: z.number().default(0),
        status: z.enum(["active", "inactive", "draft", "out_of_stock"]).default("draft"),
        isFeatured: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(products).values(input);
      const insertId = Number((result as any)[0]?.insertId);
      return { id: insertId, ...input };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number().optional(),
        brand: z.string().optional(),
        price: z.string().optional(),
        salePrice: z.string().optional(),
        image: z.string().optional(),
        stockQuantity: z.number().optional(),
        status: z.enum(["active", "inactive", "draft", "out_of_stock"]).optional(),
        isFeatured: z.boolean().optional(),
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(products).where(eq(products.id, input.id));
      return { success: true };
    }),

  toggleStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["active", "inactive", "draft", "out_of_stock"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(products).set({ status: input.status }).where(eq(products.id, input.id));
      const [updated] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      return updated;
    }),
});
