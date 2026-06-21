import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import { orders, orderItems, products } from "@db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

function generateOrderNumber(): string {
  const prefix = "AYE";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const orderRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const filters = input || { page: 1, limit: 10 };
      const page = filters.page;
      const limit = filters.limit;
      const offset = (page - 1) * limit;

      const conditions = [];

      // Users see only their own orders; admins see all
      if (ctx.user?.role !== "admin") {
        if (!ctx.user) return { items: [], total: 0, page, totalPages: 0 };
        conditions.push(eq(orders.userId, ctx.user.id));
      }

      if (filters.status) {
        conditions.push(eq(orders.status, filters.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(orders)
          .where(whereClause)
          .orderBy(desc(orders.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(whereClause),
      ]);

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        items.map(async (order) => {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));
          return { ...order, items };
        })
      );

      const total = countResult[0]?.count || 0;

      return {
        items: ordersWithItems,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) return null;

      // Check authorization
      if (ctx.user?.role !== "admin" && order.userId !== ctx.user?.id) {
        return null;
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),

  create: publicQuery
    .input(
      z.object({
        shippingAddress: z.object({
          firstName: z.string(),
          lastName: z.string(),
          phone: z.string(),
          city: z.string(),
          district: z.string(),
          streetAddress: z.string(),
          buildingNumber: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().default("Saudi Arabia"),
        }),
        paymentMethod: z.enum(["credit_card", "paypal", "cod", "stc_pay", "apple_pay"]),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            quantity: z.number().int().positive(),
            unitPrice: z.string().optional(),
          })
        ),
        subtotal: z.string().optional(),
        shippingAmount: z.string().optional(),
        taxAmount: z.string().optional(),
        total: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (input.items.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      }

      const orderNumber = generateOrderNumber();
      const verifiedItems = [] as Array<{
        productId: number;
        productName: string;
        productImage: string | null;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
      }>;

      let subtotal = 0;

      for (const item of input.items) {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product || product.status !== "active") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "One of the products is unavailable" });
        }

        if ((product.stockQuantity || 0) < item.quantity) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `${product.name} is out of stock` });
        }

        const unitPriceNumber = Number(product.salePrice || product.price);
        const lineTotal = unitPriceNumber * item.quantity;
        subtotal += lineTotal;

        verifiedItems.push({
          productId: item.productId,
          productName: product.name,
          productImage: product.image || null,
          quantity: item.quantity,
          unitPrice: unitPriceNumber.toFixed(2),
          totalPrice: lineTotal.toFixed(2),
        });
      }

      const shippingAmount = subtotal >= 500 ? 0 : 35;
      const taxAmount = subtotal * 0.15;
      const total = subtotal + shippingAmount + taxAmount;

      const shippingAddr: any = {
        firstName: input.shippingAddress.firstName,
        lastName: input.shippingAddress.lastName,
        phone: input.shippingAddress.phone,
        city: input.shippingAddress.city,
        district: input.shippingAddress.district,
        streetAddress: input.shippingAddress.streetAddress,
        buildingNumber: input.shippingAddress.buildingNumber,
        country: input.shippingAddress.country,
      };
      if (input.shippingAddress.postalCode) {
        shippingAddr.postalCode = input.shippingAddress.postalCode;
      }

      const orderInsertResult = await db
        .insert(orders)
        .values({
          orderNumber,
          userId: ctx.user?.id || null,
          guestEmail: ctx.user ? null : null,
          status: "pending",
          paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          total: total.toFixed(2),
          shippingAddress: shippingAddr,
          paymentMethod: input.paymentMethod,
          notes: input.notes || null,
        })
        .returning({ id: orders.id });

      const orderId = orderInsertResult[0].id;

      for (const item of verifiedItems) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });

        await db
          .update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      return { id: orderId, orderNumber, total: total.toFixed(2) };
    }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned", "refunded"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.id));
      const [updated] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);
      return updated;
    }),

  cancel: publicQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) throw new Error("Order not found");
      if (ctx.user?.role !== "admin" && order.userId !== ctx.user?.id) {
        throw new Error("Unauthorized");
      }

      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, input.id));

      const [updated] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      return updated;
    }),

  requestReturn: publicQuery
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) throw new Error("Order not found");
      if (ctx.user?.role !== "admin" && order.userId !== ctx.user?.id) {
        throw new Error("Unauthorized");
      }

      if (order.status !== "delivered") {
        throw new Error("Can only return delivered orders");
      }

      await db
        .update(orders)
        .set({ status: "return_requested" })
        .where(eq(orders.id, input.id));

      const [updated] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      return updated;
    }),
  trackOrder: publicQuery
    .input(z.object({ orderNumber: z.string(), phone: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (!order) return null;

      // Verify the phone number matches the order's shipping address
      const address = order.shippingAddress as any;
      if (address?.phone !== input.phone) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Phone number does not match" });
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),
});
