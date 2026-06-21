import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { categoryRouter } from "./category-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { settingsRouter } from "./settings-router";
import { analyticsRouter } from "./analytics-router";
import { reviewRouter } from "./review-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  category: categoryRouter,
  cart: cartRouter,
  order: orderRouter,
  settings: settingsRouter,
  analytics: analyticsRouter,
  review: reviewRouter,
});

export type AppRouter = typeof appRouter;
