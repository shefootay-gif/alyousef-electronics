import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function cartItemOwnerCondition(itemId: number, userId?: number, sessionId?: string) {
  if (userId) {
    return and(eq(cartItems.id, itemId), eq(cartItems.userId, userId));
  }

  if (sessionId) {
    return and(eq(cartItems.id, itemId), eq(cartItems.sessionId, sessionId));
  }

  throw new TRPCError({ code: "UNAUTHORIZED", message: "Cart session is missing" });
}

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
      if (!ctx.guestId) return { items: [], total: 0, itemCount: 0 };
      items = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.sessionId, ctx.guestId));
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

    const totalCents = itemsWithProduct.reduce((sum, item) => {
      const price = item.product?.salePrice || item.product?.price || "0";
      return sum + Math.round(Number(price) * 100) * item.quantity;
    }, 0);
    const total = totalCents / 100;

    return {
      items: itemsWithProduct,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }),

  add: publicQuery
    .input(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(20).default(1),
        variantData: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const userId = ctx.user?.id;
      const sessionId = userId ? undefined : ctx.guestId;

      if (!userId && !sessionId) {
        throw new Error("No session id for guest");
      }

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (!product || product.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Product is unavailable" });
      }

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
              eq(cartItems.sessionId, sessionId as string),
              eq(cartItems.productId, input.productId)
            )
          )
          .limit(1);
      }

      if (existing.length > 0) {
        const newQuantity = existing[0].quantity + input.quantity;
        if (newQuantity > 20) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Maximum cart quantity is 20" });
        }

        if (product.trackInventory && (product.stockQuantity || 0) < newQuantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough stock available" });
        }

        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: newQuantity })
          .where(eq(cartItems.id, existing[0].id));
        return { ...existing[0], quantity: newQuantity };
      }

      if (product.trackInventory && (product.stockQuantity || 0) < input.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough stock available" });
      }

      const insertData: typeof cartItems.$inferInsert = {
        productId: input.productId,
        quantity: input.quantity,
        variantData: input.variantData || null,
      };

      if (userId) {
        insertData.userId = userId;
      } else {
        insertData.sessionId = sessionId;
      }

      const [inserted] = await db.insert(cartItems).values(insertData).returning();

      return inserted;
    }),

  updateQuantity: publicQuery
    .input(z.object({ itemId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const ownerCondition = cartItemOwnerCondition(input.itemId, ctx.user?.id, ctx.guestId);
      const [item] = await db.select().from(cartItems).where(ownerCondition).limit(1);

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
      }

      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product || product.status !== "active") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Product is unavailable" });
      }

      if (product.trackInventory && (product.stockQuantity || 0) < input.quantity) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Not enough stock available" });
      }

      const [updated] = await db
        .update(cartItems)
        .set({ quantity: input.quantity })
        .where(ownerCondition)
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
      }

      return updated;
    }),

  remove: publicQuery
    .input(z.object({ itemId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const ownerCondition = cartItemOwnerCondition(input.itemId, ctx.user?.id, ctx.guestId);
      await db.delete(cartItems).where(ownerCondition);
      return { success: true };
    }),

  clear: publicQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user?.id;

    if (userId) {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } else if (ctx.guestId) {
      await db.delete(cartItems).where(eq(cartItems.sessionId, ctx.guestId));
    }

    return { success: true };
  }),
});
