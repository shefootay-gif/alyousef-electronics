import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, products, orders, orderItems } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { assertRateLimit } from "./lib/security";

export const reviewRouter = createRouter({
  listByProduct: publicQuery
    .input(z.object({ productId: z.number().int().positive(), limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, input.productId))
        .orderBy(desc(reviews.createdAt))
        .limit(input.limit);
    }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number().int().positive(),
        rating: z.number().min(1).max(5),
        title: z.string().trim().max(120).optional(),
        comment: z.string().trim().max(2_000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const limited = assertRateLimit(
        "review:add",
        ctx.req.headers,
        { windowMs: 60 * 60_000, max: 8 },
        `user:${ctx.user.id}`,
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      // Check if user already reviewed this product
      const existingReview = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.userId, ctx.user!.id)))
        .limit(1);

      if (existingReview.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "You already reviewed this product" });
      }

      const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      if (!product || product.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Product is unavailable" });
      }

      const [deliveredPurchase] = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.productId, input.productId),
            eq(orders.userId, ctx.user.id),
            eq(orders.status, "delivered"),
          ),
        )
        .limit(1);

      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user!.id,
        userName: ctx.user!.name,
        userAvatar: ctx.user!.avatar,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: Boolean(deliveredPurchase),
      });

      // Update product's average rating and count
      const allReviews = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.productId, input.productId));

      const count = allReviews.length;
      const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = count > 0 ? sum / count : 0;

      await db
        .update(products)
        .set({ averageRating: avg.toFixed(2), reviewCount: count })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),
});
