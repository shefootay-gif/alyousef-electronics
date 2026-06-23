import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, users } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const customerRouter = createRouter({
  list: adminQuery
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const limit = input?.limit || 50;
      const rows = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          role: users.role,
          createdAt: users.createdAt,
          ordersCount: sql<number>`count(${orders.id})`,
          totalSpent: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
        })
        .from(users)
        .leftJoin(orders, eq(orders.userId, users.id))
        .groupBy(users.id)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      return rows;
    }),

  get: adminQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [customer] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        role: users.role,
        phone: users.phone,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastSignInAt: users.lastSignInAt,
      })
      .from(users)
      .where(eq(users.id, input.id))
      .limit(1);
    if (!customer) return null;
    const customerOrders = await db.select().from(orders).where(eq(orders.userId, input.id)).orderBy(desc(orders.createdAt));
    return { ...customer, orders: customerOrders };
  }),
});
