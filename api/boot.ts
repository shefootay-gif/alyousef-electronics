import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { nanoid } from "nanoid";

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

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
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
