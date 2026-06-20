import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const cartRouter = createRouter({
  get: publicQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user?.id;

    let items;
    if (userId) {
      items = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, userId));
    } else {
      items = await db
        .select()
        .from(cartItems)
        .where(isNotNull(cartItems.sessionId));
    }

    // Get all products
    const allProducts: typeof products.$inferSelect[] = [];
    for (const item of items) {
      const [p] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (p) allProducts.push(p);
    }

    const itemsWithProduct = items.map(item => ({
      ...item,
      product: allProducts.find(p => p.id === item.productId) || null,
    }));

    const total = itemsWithProduct.reduce((sum, item) => {
      const price = item.product?.salePrice || item.product?.price || "0";
      return sum + Number(price) * item.quantity;
    }, 0);

    return {
      items: itemsWithProduct,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }),

  add: publicQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().default(1),
        variantData: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = userId ? undefined : "guest_session";

      // Check if item already in cart
      let existing;
      if (userId) {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, input.productId)
            )
          )
          .limit(1);
      } else {
        existing = await db
          .select()
          .from(cartItems)
          .where(
            and(
              isNotNull(cartItems.sessionId),
              eq(cartItems.productId, input.productId)
            )
          )
          .limit(1);
      }

      if (existing.length > 0) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(cartItems.id, existing[0].id));
        return { ...existing[0], quantity: existing[0].quantity + input.quantity };
      }

      const insertData: any = {
        productId: input.productId,
        quantity: input.quantity,
        variantData: input.variantData || null,
      };

      if (userId) {
        insertData.userId = userId;
      } else {
        insertData.sessionId = sessionId;
      }

      const result = await db.insert(cartItems).values(insertData);
      const insertId = Number((result as any)[0]?.insertId);

      return { id: insertId, ...input, userId: userId || null, sessionId: sessionId || null };
    }),

  updateQuantity: publicQuery
    .input(z.object({ itemId: z.number(), quantity: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(cartItems)
        .set({ quantity: input.quantity })
        .where(eq(cartItems.id, input.itemId));
      const [updated] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, input.itemId))
        .limit(1);
      return updated;
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.itemId));
      return { success: true };
    }),

  clear: publicQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user?.id;

    if (userId) {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } else {
      await db.delete(cartItems).where(isNotNull(cartItems.sessionId));
    }

    return { success: true };
  }),
});
