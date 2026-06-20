import * as cookie from "cookie";
import type { SerializeOptions } from "cookie";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { z } from "zod";
import * as crypto from "node:crypto";
import { findUserByEmail, upsertUser } from "./queries/users";
import { TRPCError } from "@trpc/server";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";
import { nanoid } from "nanoid";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
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
  me: authedQuery.query((opts) => opts.ctx.user),
  
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const isValid = verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      }

      const token = await signSessionToken({
        unionId: user.unionId,
        clientId: env.appId,
      });

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(
          Session.cookieName,
          token,
          toCookieSerializeOptions(ctx.req.headers, Session.maxAgeMs / 1000),
        )
      );

      return { success: true, user };
    }),

  register: publicQuery
    .input(z.object({ name: z.string(), email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
      }

      const passwordHash = hashPassword(input.password);
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
        clientId: env.appId,
      });

      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(
          Session.cookieName,
          token,
          toCookieSerializeOptions(ctx.req.headers, Session.maxAgeMs / 1000),
        )
      );

      return { success: true, user };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", toCookieSerializeOptions(ctx.req.headers, 0)),
    );
    return { success: true };
  }),
});
