import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { env } from "./lib/env";
import { verify } from "hono/jwt";
import * as cookie from "cookie";
import { findUserByEmail } from "./queries/users";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const cookieHeader = opts.req.headers.get("cookie");
    if (cookieHeader) {
      const parsed = cookie.parse(cookieHeader);
      // Try 'kimi_sid' (Local Auth) first, then 'token' (Google Auth)
      const token = parsed["kimi_sid"] || parsed["token"];
      if (token) {
        const payload = await verify(token, env.jwtSecret);
        if (payload && payload.unionId) {
          const db = getDb();
          const userRecords = await db.select().from(users).where(eq(users.unionId, payload.unionId as string)).limit(1);
          if (userRecords.length > 0) {
            ctx.user = userRecords[0];
          }
        }
      }
    }
  } catch (error) {
    // Authentication is optional here
  }
  return ctx;
}
