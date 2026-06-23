import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext, getAuthenticatedUser } from "./context";
import { env } from "./lib/env";
import { Session } from "@contracts/constants";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { nanoid } from "nanoid";
import { createGoogleAuthUrl, handleGoogleCallback } from "./google/auth";
import { setCookie } from "hono/cookie";
import { getSessionCookieOptions } from "./lib/cookies";
import {
  applyHttpRateLimit,
  constantTimeEqual,
  safeJsonParse,
  securityHeaders,
  trustedOriginGuard,
  verifyImageSignature,
} from "./lib/security";

const app = new Hono<{ Bindings: HttpBindings }>();
const maxUploadBytes = 5 * 1024 * 1024;
const allowedUploadTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

app.use("*", securityHeaders);
app.use("*", trustedOriginGuard);
app.use("/api/trpc/*", bodyLimit({ maxSize: 1024 * 1024 }));
app.use("/api/webhooks/*", bodyLimit({ maxSize: 1024 * 1024 }));
app.use("/api/upload", bodyLimit({ maxSize: maxUploadBytes }));

// Serve static uploads
app.use("/uploads/*", serveStatic({ root: "./public" }));

app.post("/api/upload", async (c) => {
  try {
    const limited = await applyHttpRateLimit(c, "upload", { windowMs: 10 * 60_000, max: 20 });
    if (limited) return limited;

    const user = await getAuthenticatedUser(c.req.raw);
    if (user?.role !== "admin") {
      return c.json({ error: "Admin permissions are required" }, 403);
    }

    const body = await c.req.parseBody();
    const file = body["file"];
    if (file && typeof file === "object" && "name" in file && "type" in file && "arrayBuffer" in file) {
      const uploadFile = file as File;
      const expectedExt = allowedUploadTypes.get(uploadFile.type);
      if (!expectedExt) {
        return c.json({ error: "Only image uploads are allowed" }, 400);
      }

      if (uploadFile.size > maxUploadBytes) {
        return c.json({ error: "Image is too large" }, 413);
      }

      const originalExt = path.extname(uploadFile.name).toLowerCase();
      const ext = originalExt ? (originalExt === ".jpeg" ? ".jpg" : originalExt) : expectedExt;
      if (ext && ext !== expectedExt) {
        return c.json({ error: "File extension does not match its content type" }, 400);
      }

      const filename = `${nanoid()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await uploadFile.arrayBuffer());
      if (!verifyImageSignature(buffer, uploadFile.type)) {
        return c.json({ error: "Invalid image content" }, 400);
      }

      await fs.writeFile(path.join(uploadDir, filename), buffer, { flag: "wx" });
      return c.json({ url: `/uploads/${filename}` });
    }
    return c.json({ error: "No file uploaded" }, 400);
  } catch {
    return c.json({ error: "Upload failed" }, 500);
  }
});

app.post("/api/webhooks/payment", async (c) => {
  try {
    const limited = await applyHttpRateLimit(c, "webhook:payment", { windowMs: 60_000, max: 60 });
    if (limited) return limited;

    if (!env.paymentWebhookSecret) {
      return c.json({ error: "Payment webhook is not configured" }, 503);
    }

    const rawBody = await c.req.text();
    const signature = c.req.header("x-webhook-signature");

    const expected = crypto
      .createHmac("sha256", env.paymentWebhookSecret)
      .update(rawBody)
      .digest("hex");
    const expectedWithPrefix = `sha256=${expected}`;

    if (
      !signature ||
      (!constantTimeEqual(signature, expected) && !constantTimeEqual(signature, expectedWithPrefix))
    ) {
      return c.json({ error: "Invalid webhook signature" }, 401);
    }

    const payload = safeJsonParse<{
      orderId?: number;
      providerReference?: string;
      status?: "paid" | "failed" | "refunded";
      amount?: string;
      provider?: "paymob" | "fawry" | "stripe" | "manual";
    }>(rawBody);

    if (!payload?.orderId || !payload.status) {
      return c.json({ error: "Invalid webhook payload" }, 400);
    }

    const { getDb } = await import("./queries/connection");
    const { orders, paymentTransactions } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");
    const db = getDb();

    const [order] = await db.select().from(orders).where(eq(orders.id, payload.orderId)).limit(1);
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    if (payload.amount !== undefined) {
      const expectedAmount = Number(order.total);
      const receivedAmount = Number(payload.amount);
      if (!Number.isFinite(receivedAmount) || Math.abs(expectedAmount - receivedAmount) > 0.01) {
        return c.json({ error: "Payment amount mismatch" }, 400);
      }
    }

    const paymentStatus = payload.status === "paid" ? "paid" : payload.status === "refunded" ? "refunded" : "failed";

    await db.transaction(async (tx) => {
      await tx.update(orders).set({ paymentStatus }).where(eq(orders.id, payload.orderId!));
      await tx.insert(paymentTransactions).values({
        orderId: payload.orderId!,
        provider: payload.provider || "manual",
        providerReference: payload.providerReference,
        amount: payload.amount || order.total,
        currency: "EGP",
        status: paymentStatus,
        rawPayload: payload,
      });
    });

    return c.json({ received: true, paymentStatus });
  } catch {
    return c.json({ error: "Webhook Error" }, 400);
  }
});

// Dropshipping Webhook (Zendrop/AliExpress generic receiver)
app.post("/api/webhooks/dropship/product", async (c) => {
  try {
    const limited = await applyHttpRateLimit(c, "webhook:dropship", { windowMs: 60_000, max: 120 });
    if (limited) return limited;

    const apiKey = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!apiKey) return c.json({ error: "Unauthorized" }, 401);

    // Dynamic import to avoid circular dependencies if any
    const { getDb } = await import("./queries/connection");
    const { apiKeys } = await import("@db/schema");
    const { eq } = await import("drizzle-orm");

    const db = getDb();
    const activeKeys = await db.select().from(apiKeys).where(eq(apiKeys.isActive, true));
    const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const keyRecord = activeKeys.find((record) =>
      record.keyHash
        ? constantTimeEqual(record.keyHash, apiKeyHash)
        : constantTimeEqual(record.key, apiKey),
    );
    
    if (!keyRecord) {
      return c.json({ error: "Invalid API Key" }, 401);
    }

    const _payload = await c.req.json();
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyRecord.id));
    
    // Example logic: Create or update product
    // ...

    return c.json({ success: true, message: "Product synced" });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Webhook Error" }, 400);
  }
});

app.get("/api/health", (c) => {
  return c.json({ status: "ok", message: "Server is awake!" }, 200);
});


app.get("/api/seed", async (c) => {
  if (env.isProduction) {
    return c.json({ error: "Seed endpoint is disabled in production" }, 403);
  }

  const host = c.req.header("host") || "";
  if (!host.startsWith("localhost:") && !host.startsWith("127.0.0.1:")) {
    return c.json({ error: "Seed endpoint is only available locally" }, 403);
  }

  try {
    const { execSync } = await import("node:child_process");
    execSync("npx drizzle-kit push && npx tsx db/seed.ts", { stdio: "inherit" });
    return c.json({ success: true, message: "Database seeded successfully!" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed";
    return c.json({ success: false, error: message }, 500);
  }
});

app.get("/api/auth/google/login", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.redirect(createGoogleAuthUrl(origin));
});

app.get("/api/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const origin = new URL(c.req.url).origin;
  if (!code) return c.json({ error: "No code provided" }, 400);

  try {
    const jwt = await handleGoogleCallback(code, origin);
    const cookieOptions = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, jwt, {
      httpOnly: true,
      secure: cookieOptions.secure,
      sameSite: "Lax",
      maxAge: Session.maxAgeMs / 1000,
      path: "/",
    });
    return c.redirect("/");
  } catch (error) {
    console.error("Google Auth Error:", error);
    return c.redirect("/login?error=auth_failed");
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");

  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
