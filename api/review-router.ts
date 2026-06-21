import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, products, users } from "@db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewRouter = createRouter({
  listByProduct: publicQuery
    .input(z.object({ productId: z.number(), limit: z.number().default(10) }))
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
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Check if user already reviewed this product
      const existingReview = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.productId, input.productId), eq(reviews.userId, ctx.user!.id)))
        .limit(1);

      if (existingReview.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "You already reviewed this product" });
      }

      await db.insert(reviews).values({
        productId: input.productId,
        userId: ctx.user!.id,
        userName: ctx.user!.name,
        userAvatar: ctx.user!.avatar,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerified: true, // simplified
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
        .set({ averageRating: avg, reviewCount: count })
        .where(eq(products.id, input.productId));

      return { success: true };
    }),
});
