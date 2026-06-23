import type { Context, Next } from "hono";
import * as nodeCrypto from "node:crypto";
import { env } from "./env";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastRateLimitSweep = Date.now();

function normalizeIp(value: string | null): string {
  if (!value) return "unknown";
  return value.split(",")[0]?.trim().toLowerCase() || "unknown";
}

export function getClientIp(headers: Headers): string {
  return normalizeIp(
    headers.get("cf-connecting-ip") ||
      headers.get("x-real-ip") ||
      headers.get("x-forwarded-for"),
  );
}

export function checkRateLimit(
  bucket: string,
  identifier: string,
  options: RateLimitOptions,
) {
  const now = Date.now();

  if (now - lastRateLimitSweep > 60_000) {
    lastRateLimitSweep = now;
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) rateLimitStore.delete(key);
    }
  }

  const key = `${bucket}:${identifier}`;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, remaining: options.max - 1, retryAfter: 0 };
  }

  if (entry.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, options.max - entry.count),
    retryAfter: 0,
  };
}

export function assertRateLimit(
  bucket: string,
  headers: Headers,
  options: RateLimitOptions,
  extraIdentifier = "",
) {
  const identifier = `${getClientIp(headers)}:${extraIdentifier}`;
  const result = checkRateLimit(bucket, identifier, options);
  if (!result.allowed) {
    return {
      retryAfter: result.retryAfter,
      message: "Too many requests. Please try again later.",
    };
  }
  return null;
}

export async function applyHttpRateLimit(
  c: Context,
  bucket: string,
  options: RateLimitOptions,
  extraIdentifier = "",
) {
  const limited = assertRateLimit(bucket, c.req.raw.headers, options, extraIdentifier);
  if (!limited) return null;

  c.header("Retry-After", String(limited.retryAfter));
  return c.json({ error: limited.message }, 429);
}

function getRequestOrigin(c: Context): URL | null {
  const origin = c.req.header("origin") || c.req.header("referer");
  if (!origin) return null;

  try {
    return new URL(origin);
  } catch {
    return null;
  }
}

function getRequestHost(c: Context): string {
  return (
    c.req.header("x-forwarded-host") ||
    c.req.header("host") ||
    ""
  ).toLowerCase();
}

function isAllowedOrigin(c: Context): boolean {
  const originUrl = getRequestOrigin(c);
  if (!originUrl) return true;

  const requestHost = getRequestHost(c);
  const originHost = originUrl.host.toLowerCase();
  const origin = originUrl.origin.toLowerCase();

  return originHost === requestHost || env.allowedOrigins.includes(origin);
}

function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://analytics.tiktok.com https://sc-static.net",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
  ];

  if (env.isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export async function securityHeaders(c: Context, next: Next) {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)",
  );
  c.header("Cross-Origin-Opener-Policy", "same-origin");
  c.header("Cross-Origin-Resource-Policy", "same-origin");

  if (!c.req.path.startsWith("/api/")) {
    c.header("Content-Security-Policy", buildContentSecurityPolicy());
  }

  if (env.isProduction) {
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  await next();
}

export async function trustedOriginGuard(c: Context, next: Next) {
  const method = c.req.method.toUpperCase();
  const mutatesState = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isWebhook = c.req.path.startsWith("/api/webhooks/");

  if (mutatesState && !isWebhook && !isAllowedOrigin(c)) {
    return c.json({ error: "Invalid request origin" }, 403);
  }

  await next();
}

export function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return nodeCrypto.timingSafeEqual(left, right);
}

export function verifyImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  if (mimeType === "image/gif") {
    const signature = buffer.subarray(0, 6).toString("ascii");
    return signature === "GIF87a" || signature === "GIF89a";
  }

  return false;
}

export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
