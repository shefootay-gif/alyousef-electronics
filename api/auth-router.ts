import * as cookie from "cookie";
import type { SerializeOptions } from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { z } from "zod";
import * as crypto from "node:crypto";
import { promisify } from "node:util";
import { findUserByEmail, upsertUser } from "./queries/users";
import { TRPCError } from "@trpc/server";
import { signSessionToken } from "./kimi/session";
import { nanoid } from "nanoid";
import { assertRateLimit } from "./lib/security";
import type { User } from "@db/schema";

const scryptAsync = promisify(crypto.scrypt);

function sanitizeUser(user: User) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) return false;

  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  if (keyBuffer.length !== derivedKey.length) return false;

  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function toCookieSerializeOptions(headers: Headers, maxAge?: number): SerializeOptions {
  const opts = getSessionCookieOptions(headers);
  return {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "strict" | "none" | undefined,
    secure: opts.secure,
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => sanitizeUser(opts.ctx.user)),
  
  login: publicQuery
    .input(z.object({ email: z.string().email().toLowerCase().trim(), password: z.string().min(1).max(128) }))
    .mutation(async ({ input, ctx }) => {
      const limited = assertRateLimit(
        "auth:login",
        ctx.req.headers,
        { windowMs: 15 * 60_000, max: 8 },
        input.email,
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      const user = await findUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const isValid = await verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "local_auth",
      });

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(
          Session.cookieName,
          token,
          toCookieSerializeOptions(ctx.req.headers, Session.maxAgeMs / 1000),
        )
      );

      return { success: true, user: sanitizeUser(user) };
    }),

  register: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(2).max(80),
        email: z.string().email().toLowerCase().trim(),
        password: z
          .string()
          .min(10, "Password must be at least 10 characters")
          .max(128)
          .regex(/[a-z]/, "Password must include a lowercase letter")
          .regex(/[A-Z]/, "Password must include an uppercase letter")
          .regex(/[0-9]/, "Password must include a number"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const limited = assertRateLimit(
        "auth:register",
        ctx.req.headers,
        { windowMs: 60 * 60_000, max: 5 },
        input.email,
      );

      if (limited) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: limited.message });
      }

      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
      }

      const passwordHash = await hashPassword(input.password);
      const unionId = `local_${nanoid()}`;

      await upsertUser({
        unionId,
        name: input.name,
        email: input.email,
        passwordHash,
      });

      const user = await findUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: "local_auth",
      });

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(
          Session.cookieName,
          token,
          toCookieSerializeOptions(ctx.req.headers, Session.maxAgeMs / 1000),
        )
      );

      return { success: true, user: sanitizeUser(user) };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", toCookieSerializeOptions(ctx.req.headers, 0)),
    );
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize("token", "", toCookieSerializeOptions(ctx.req.headers, 0)),
    );
    return { success: true };
  }),
});
