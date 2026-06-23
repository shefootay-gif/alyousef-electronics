import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { coupons } from "@db/schema";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { calculateCouponDiscount, normalizeCouponCode } from "./lib/commerce";
import { assertRateLimit } from "./lib/security";

const CouponFields = z.object({
  code: z.string().trim().min(2).max(40),
  type: z.enum(["percentage", "fixed"]),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/),
  minSubtotal: z.string().regex(/^\d+(\.\d{1,2})?$/).default("0"),
  maxDiscount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

function validateCouponShape(
  coupon: { type?: "percentage" | "fixed"; value?: string },
  ctx: z.RefinementCtx,
) {
  if (!coupon.value) return;

  const value = Number(coupon.value);
  if (value <= 0) {
    ctx.addIssue({ code: "custom", message: "Coupon value must be positive", path: ["value"] });
  }

  if (coupon.type === "percentage" && value > 100) {
    ctx.addIssue({ code: "custom", message: "Percentage coupon cannot exceed 100", path: ["value"] });
  }
}

const CouponInput = CouponFields.superRefine(validateCouponShape);
const CouponUpdateInput = CouponFields.partial()
  .extend({ id: z.number().int().positive() })
  .superRefine(validateCouponShape);

export const promotionRouter = createRouter({
  validateCoupon: publicQuery
    .input(z.object({ code: z.string().trim().min(2).max(40), subtotal: z.number().nonnegative().max(1_000_000) }))
    .query(async ({ ctx, input }) => {
      const limited = assertRateLimit(
        "coupon:validate",
        ctx.req.headers,
        { windowMs: 10 * 60_000, max: 30 },
        normalizeCouponCode(input.code),
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      const db = getDb();
      const code = normalizeCouponCode(input.code);
      const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);

      if (!coupon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Coupon not found" });
      }

      const discountAmount = calculateCouponDiscount(coupon, input.subtotal);
      return {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
      };
    }),

  list: adminQuery.query(async () => {
    return getDb().select().from(coupons).orderBy(desc(coupons.createdAt));
  }),

  create: adminQuery.input(CouponInput).mutation(async ({ input }) => {
    const db = getDb();
    const [created] = await db
      .insert(coupons)
      .values({
        ...input,
        code: normalizeCouponCode(input.code),
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      })
      .returning();
    return created;
  }),

  update: adminQuery
    .input(CouponUpdateInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, startsAt, expiresAt, code, ...data } = input;
      const [updated] = await db
        .update(coupons)
        .set({
          ...data,
          ...(code ? { code: normalizeCouponCode(code) } : {}),
          ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
          ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        })
        .where(eq(coupons.id, id))
        .returning();
      return updated;
    }),

  delete: adminQuery.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
    await getDb().delete(coupons).where(eq(coupons.id, input.id));
    return { success: true };
  }),
});
