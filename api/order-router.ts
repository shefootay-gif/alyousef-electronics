import { z } from "zod";
import { createRouter, publicQuery, adminQuery, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { getDb } from "./queries/connection";
import { couponRedemptions, coupons, invoices, orders, orderItems, paymentTransactions, products, shippingRates } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { sendOrderConfirmation } from "./lib/email";
import { nanoid } from "nanoid";
import { calculateCouponDiscount, calculateShippingAmount, normalizeCouponCode } from "./lib/commerce";
import { assertRateLimit } from "./lib/security";

type ShippingAddress = NonNullable<(typeof orders.$inferInsert)["shippingAddress"]>;

function generateOrderNumber(): string {
  const prefix = "AYE";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).replace(/[-_]/g, "").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
]);

const PaymentMethodSchema = z.enum([
  "credit_card",
  "paypal",
  "cod",
  "stc_pay",
  "apple_pay",
  "paymob",
  "fawry",
]);

const PhoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[0-9\s-]+$/, "Invalid phone number");

export const orderRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(10),
        status: OrderStatusSchema.optional(),
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
        conditions.push(eq(orders.status, filters.status));
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
          firstName: z.string().trim().min(2).max(80),
          lastName: z.string().trim().min(2).max(80),
          email: z.string().email().toLowerCase().trim().optional(),
          phone: PhoneSchema,
          city: z.string().trim().min(2).max(80),
          district: z.string().trim().min(2).max(120),
          streetAddress: z.string().trim().min(5).max(240),
          buildingNumber: z.string().trim().max(40).optional(),
          postalCode: z.string().trim().max(20).optional(),
          country: z.string().trim().min(2).max(80).default("Egypt"),
        }),
        paymentMethod: PaymentMethodSchema,
        couponCode: z.string().trim().max(40).optional(),
        shippingRateId: z.number().int().positive().optional(),
        notes: z.string().trim().max(500).optional(),
        items: z.array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().positive().max(20),
            unitPrice: z.string().optional(),
          })
        ).min(1).max(100),
        subtotal: z.string().optional(),
        shippingAmount: z.string().optional(),
        taxAmount: z.string().optional(),
        total: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const limited = assertRateLimit(
        "order:create",
        ctx.req.headers,
        { windowMs: 10 * 60_000, max: 10 },
        ctx.user ? `user:${ctx.user.id}` : `guest:${ctx.guestId || "anonymous"}`,
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      if (input.items.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      }

      if (!ctx.user && !input.shippingAddress.email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Guest orders require an email address" });
      }

      const orderNumber = generateOrderNumber();
      const verifiedItems = [] as Array<{
        productId: number;
        productName: string;
        productImage: string | null;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
        trackInventory: boolean | null;
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

        if (product.trackInventory && (product.stockQuantity || 0) < item.quantity) {
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
          trackInventory: product.trackInventory,
        });
      }

      let selectedCoupon: typeof coupons.$inferSelect | null = null;
      let couponId: number | null = null;
      let discountAmount = 0;
      if (input.couponCode?.trim()) {
        const code = normalizeCouponCode(input.couponCode);
        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
        if (!coupon) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon not found" });
        }
        selectedCoupon = coupon;
        couponId = coupon.id;
        discountAmount = calculateCouponDiscount(coupon, subtotal);
      }

      let shippingAmount = subtotal >= 5000 ? 0 : 35;
      if (input.shippingRateId) {
        const [rate] = await db.select().from(shippingRates).where(eq(shippingRates.id, input.shippingRateId)).limit(1);
        if (!rate || !rate.isActive) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Shipping rate is unavailable" });
        }
        shippingAmount = calculateShippingAmount(rate, subtotal);
      }

      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      const taxAmount = taxableSubtotal * 0.15;
      const total = taxableSubtotal + shippingAmount + taxAmount;

      const shippingAddr: ShippingAddress = {
        firstName: input.shippingAddress.firstName,
        lastName: input.shippingAddress.lastName,
        email: input.shippingAddress.email,
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

      const orderId = await db.transaction(async (tx) => {
        const orderInsertResult = await tx
          .insert(orders)
          .values({
            orderNumber,
            userId: ctx.user?.id || null,
            guestEmail: ctx.user ? null : input.shippingAddress.email || null,
            guestPhone: ctx.user ? null : input.shippingAddress.phone,
            status: "pending",
            paymentStatus: "pending",
            subtotal: subtotal.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            shippingAmount: shippingAmount.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            total: total.toFixed(2),
            shippingAddress: shippingAddr,
            paymentMethod: input.paymentMethod,
            notes: input.notes || null,
          })
          .returning({ id: orders.id });

        const createdOrderId = orderInsertResult[0].id;

        for (const item of verifiedItems) {
          await tx.insert(orderItems).values({
            orderId: createdOrderId,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          });

          if (item.trackInventory) {
            const [stockUpdate] = await tx
              .update(products)
              .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
              .where(and(eq(products.id, item.productId), gte(products.stockQuantity, item.quantity)))
              .returning({ id: products.id });

            if (!stockUpdate) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `${item.productName} no longer has enough stock`,
              });
            }
          }
        }

        await tx.insert(paymentTransactions).values({
          orderId: createdOrderId,
          provider: input.paymentMethod === "cod" ? "cod" : input.paymentMethod === "fawry" ? "fawry" : "paymob",
          amount: total.toFixed(2),
          currency: "EGP",
          status: "pending",
        });

        await tx.insert(invoices).values({
          invoiceNumber: `INV-${orderNumber}`,
          orderId: createdOrderId,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          total: total.toFixed(2),
          currency: "EGP",
        });

        if (couponId && selectedCoupon) {
          const couponWhere = selectedCoupon.usageLimit
            ? and(
                eq(coupons.id, couponId),
                sql`COALESCE(${coupons.usedCount}, 0) < ${selectedCoupon.usageLimit}`,
              )
            : eq(coupons.id, couponId);

          const [couponUpdate] = await tx
            .update(coupons)
            .set({ usedCount: sql`COALESCE(${coupons.usedCount}, 0) + 1` })
            .where(couponWhere)
            .returning({ id: coupons.id });

          if (!couponUpdate) {
            throw new TRPCError({ code: "CONFLICT", message: "Coupon usage limit reached" });
          }

          await tx.insert(couponRedemptions).values({
            couponId,
            orderId: createdOrderId,
            userId: ctx.user?.id || null,
            discountAmount: discountAmount.toFixed(2),
          });
        }

        return createdOrderId;
      });

      if (input.shippingAddress.email) {
        await sendOrderConfirmation(input.shippingAddress.email, {
          orderNumber,
          total: total.toFixed(2),
          items: verifiedItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice
          }))
        });
      }

      return { id: orderId, orderNumber, total: total.toFixed(2) };
    }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number().int().positive(), status: OrderStatusSchema }))
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

  cancel: authedQuery
    .input(z.object({ id: z.number().int().positive(), reason: z.string().trim().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (ctx.user?.role !== "admin" && order.userId !== ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      if (order.status !== "pending" && order.status !== "processing") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Only pending or processing orders can be cancelled" });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({ status: "cancelled" })
          .where(eq(orders.id, input.id));

        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, input.id));
        for (const item of items) {
          await tx
            .update(products)
            .set({ stockQuantity: sql`COALESCE(${products.stockQuantity}, 0) + ${item.quantity}` })
            .where(and(eq(products.id, item.productId), eq(products.trackInventory, true)));
        }
      });

      const [updated] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      return updated;
    }),

  requestReturn: authedQuery
    .input(z.object({ id: z.number().int().positive(), reason: z.string().trim().max(500).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.id))
        .limit(1);

      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (ctx.user?.role !== "admin" && order.userId !== ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
      }

      if (order.status !== "delivered") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Can only return delivered orders" });
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
    .input(z.object({ orderNumber: z.string().trim().min(4).max(80), phone: PhoneSchema }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const limited = assertRateLimit(
        "order:track",
        ctx.req.headers,
        { windowMs: 10 * 60_000, max: 12 },
        input.orderNumber,
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (!order) return null;

      // Verify the phone number matches the order's shipping address
      const address = order.shippingAddress as { phone?: string } | null;
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
