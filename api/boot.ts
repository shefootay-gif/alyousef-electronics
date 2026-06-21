import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { Paths } from "@contracts/constants";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { nanoid } from "nanoid";
import { createGoogleAuthUrl, handleGoogleCallback } from "./google/auth";
import { setCookie } from "hono/cookie";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Serve static uploads
app.use("/uploads/*", serveStatic({ root: "./public" }));

app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];
    if (file && typeof file === "object" && "name" in file) {
      const ext = path.extname(file.name);
      const filename = `${nanoid()}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const buffer = await file.arrayBuffer();
      await fs.writeFile(path.join(uploadDir, filename), Buffer.from(buffer));
      return c.json({ url: `/uploads/${filename}` });
    }
    return c.json({ error: "No file uploaded" }, 400);
  } catch (error) {
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Mock Webhook for Payment Gateways (Stripe/PayPal/STC Pay)
app.post("/api/webhooks/payment", async (c) => {
  try {
    const payload = await c.req.json();
    // Validate signature here
    // e.g. const sig = c.req.header("stripe-signature");
    
    console.log("Received payment webhook:", payload);
    
    // Process payment status update in database
    // if (payload.type === 'payment_intent.succeeded') { ... }

    return c.json({ received: true });
  } catch (err) {
    return c.json({ error: "Webhook Error" }, 400);
  }
});


app.get("/api/seed", async (c) => {
  try {
    const { execSync } = await import("node:child_process");
    execSync("npx drizzle-kit push && npx tsx db/seed.ts", { stdio: "inherit" });
    return c.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return c.json({ success: false, error: error.message || "Failed to seed" }, 500);
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
    setCookie(c, "token", jwt, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
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

  try {
    const { execSync } = await import("node:child_process");
    console.log("Running database migrations and seed...");
    execSync("npx drizzle-kit push && npx tsx db/seed.ts", { stdio: "inherit" });
    console.log("Database ready!");
  } catch (error) {
    console.error("Failed to migrate/seed database:", error);
  }

  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
