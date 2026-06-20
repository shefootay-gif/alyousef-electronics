import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, products, users, orderItems } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export const analyticsRouter = createRouter({
  dashboard: adminQuery
    .input(z.object({ period: z.enum(["7d", "30d", "90d"]).default("30d") }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const period = input?.period || "30d";
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        revenueResult,
        ordersResult,
        customersResult,
        productCount,
        lowStockProducts,
      ] = await Promise.all([
        db
          .select({ total: sql<string>`COALESCE(SUM(${orders.total}), 0)` })
          .from(orders)
          .where(gte(orders.createdAt, startDate)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(gte(orders.createdAt, startDate)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(gte(users.createdAt, startDate)),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(eq(products.status, "active")),
        db
          .select()
          .from(products)
          .where(and(eq(products.status, "active"), sql`${products.stockQuantity} <= ${products.lowStockThreshold}`))
          .limit(5),
      ]);

      return {
        revenue: Number(revenueResult[0]?.total || 0),
        totalOrders: ordersResult[0]?.count || 0,
        newCustomers: customersResult[0]?.count || 0,
        activeProducts: productCount[0]?.count || 0,
        lowStockProducts,
      };
    }),

  revenue: adminQuery
    .input(
      z.object({
        period: z.enum(["7d", "30d", "90d"]).default("30d"),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const period = input?.period || "30d";
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await db
        .select({
          date: sql<string>`DATE(${orders.createdAt})`,
          revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
          orders: sql<number>`count(*)`,
        })
        .from(orders)
        .where(gte(orders.createdAt, startDate))
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return {
        labels: result.map(r => r.date),
        data: result.map(r => Number(r.revenue)),
        orders: result.map(r => r.orders),
      };
    }),

  recentOrders: adminQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);
  }),

  productPerformance: adminQuery.query(async () => {
    const db = getDb();
    const topSelling = await db
      .select({
        productId: orderItems.productId,
        productName: orderItems.productName,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<string>`SUM(${orderItems.totalPrice})`,
      })
      .from(orderItems)
      .groupBy(orderItems.productId)
      .orderBy(desc(sql`SUM(${orderItems.quantity})`))
      .limit(10);

    return { topSelling };
  }),
});
