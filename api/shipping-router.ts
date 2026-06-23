import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { shippingRates } from "@db/schema";
import { asc, eq, or, isNull } from "drizzle-orm";
import { calculateShippingAmount } from "./lib/commerce";

const ShippingFields = z.object({
  name: z.string().trim().min(2).max(80),
  city: z.string().trim().optional().nullable(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  freeShippingThreshold: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  estimatedDaysMin: z.number().int().min(0).default(1),
  estimatedDaysMax: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
});

function validateShippingShape(
  rate: { price?: string; estimatedDaysMin?: number; estimatedDaysMax?: number },
  ctx: z.RefinementCtx,
) {
  if (rate.price !== undefined && Number(rate.price) < 0) {
    ctx.addIssue({ code: "custom", message: "Shipping price cannot be negative", path: ["price"] });
  }

  if (
    rate.estimatedDaysMax !== undefined &&
    rate.estimatedDaysMin !== undefined &&
    rate.estimatedDaysMax < rate.estimatedDaysMin
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Maximum delivery days must be greater than the minimum",
      path: ["estimatedDaysMax"],
    });
  }
}

const ShippingInput = ShippingFields.superRefine(validateShippingShape);
const ShippingUpdateInput = ShippingFields.partial()
  .extend({ id: z.number().int().positive() })
  .superRefine(validateShippingShape);

export const shippingRouter = createRouter({
  options: publicQuery
    .input(z.object({ city: z.string().optional(), subtotal: z.number().nonnegative() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rates = await db
        .select()
        .from(shippingRates)
        .where(
          input.city
            ? or(eq(shippingRates.city, input.city), isNull(shippingRates.city))
            : isNull(shippingRates.city),
        )
        .orderBy(asc(shippingRates.price));

      return rates
        .filter((rate) => rate.isActive)
        .map((rate) => ({
          ...rate,
          amount: calculateShippingAmount(rate, input.subtotal),
        }));
    }),

  list: adminQuery.query(async () => {
    return getDb().select().from(shippingRates).orderBy(asc(shippingRates.city), asc(shippingRates.price));
  }),

  create: adminQuery.input(ShippingInput).mutation(async ({ input }) => {
    const [created] = await getDb().insert(shippingRates).values(input).returning();
    return created;
  }),

  update: adminQuery.input(ShippingUpdateInput).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const [updated] = await getDb().update(shippingRates).set(data).where(eq(shippingRates.id, id)).returning();
    return updated;
  }),

  delete: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(shippingRates).where(eq(shippingRates.id, input.id));
    return { success: true };
  }),
});
