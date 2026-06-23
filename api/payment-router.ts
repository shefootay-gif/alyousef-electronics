import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { invoices, orders, paymentTransactions } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const paymentRouter = createRouter({
  transactions: adminQuery.query(async () => {
    return getDb().select().from(paymentTransactions).orderBy(desc(paymentTransactions.createdAt)).limit(100);
  }),

  invoices: adminQuery.query(async () => {
    return getDb().select().from(invoices).orderBy(desc(invoices.issuedAt)).limit(100);
  }),

  markPaid: adminQuery
    .input(z.object({ orderId: z.number().int().positive(), providerReference: z.string().trim().max(120).optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [order] = await db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, input.orderId)).returning();
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      const [transaction] = await db
        .insert(paymentTransactions)
        .values({
          orderId: input.orderId,
          provider: "manual",
          providerReference: input.providerReference,
          amount: order.total,
          currency: "EGP",
          status: "paid",
        })
        .returning();
      return { order, transaction };
    }),
});
