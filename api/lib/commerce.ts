import type { Coupon, ShippingRate } from "@db/schema";
import { TRPCError } from "@trpc/server";

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number) {
  const now = new Date();
  const minSubtotal = Number(coupon.minSubtotal || 0);
  const usageLimit = coupon.usageLimit ?? null;

  if (!coupon.isActive) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon is inactive" });
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon is not active yet" });
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon has expired" });
  }

  if (usageLimit !== null && (coupon.usedCount || 0) >= usageLimit) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Coupon usage limit reached" });
  }

  if (subtotal < minSubtotal) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Coupon requires a minimum subtotal of ${minSubtotal.toFixed(2)} EGP`,
    });
  }

  const value = Number(coupon.value);
  const rawDiscount = coupon.type === "percentage" ? subtotal * (value / 100) : value;
  const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;
  const cappedDiscount = maxDiscount !== null ? Math.min(rawDiscount, maxDiscount) : rawDiscount;

  return Math.max(0, Math.min(subtotal, cappedDiscount));
}

export function calculateShippingAmount(rate: ShippingRate, subtotal: number) {
  const threshold = rate.freeShippingThreshold ? Number(rate.freeShippingThreshold) : null;
  if (threshold !== null && subtotal >= threshold) return 0;
  return Number(rate.price);
}
