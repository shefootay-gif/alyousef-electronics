import { describe, expect, it } from "vitest";
import { calculateCouponDiscount } from "./commerce";
import type { Coupon } from "@db/schema";

const baseCoupon: Coupon = {
  id: 1,
  code: "SAVE10",
  type: "percentage",
  value: "10",
  minSubtotal: "0",
  maxDiscount: null,
  usageLimit: null,
  usedCount: 0,
  startsAt: null,
  expiresAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("commerce helpers", () => {
  it("calculates percentage coupon discounts", () => {
    expect(calculateCouponDiscount(baseCoupon, 1000)).toBe(100);
  });

  it("caps discounts at subtotal", () => {
    expect(calculateCouponDiscount({ ...baseCoupon, type: "fixed", value: "5000" }, 250)).toBe(250);
  });
});
