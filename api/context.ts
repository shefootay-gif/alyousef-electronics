import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { verifySessionToken } from "./kimi/session";
import * as cookie from "cookie";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  guestId?: string;
};

function parseGuestId(headers: Headers): string | undefined {
  const guestId = headers.get("x-guest-id") || "";
  if (/^[a-zA-Z0-9_-]{16,80}$/.test(guestId)) return guestId;
  return undefined;
}

export async function getAuthenticatedUser(req: Request): Promise<User | undefined> {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const parsed = cookie.parse(cookieHeader);
  const token = parsed["kimi_sid"] || parsed["token"];
  if (!token) return undefined;

  const payload = await verifySessionToken(token);
  if (!payload?.unionId) return undefined;

  const db = getDb();
  const userRecords = await db
    .select()
    .from(users)
    .where(eq(users.unionId, payload.unionId as string))
    .limit(1);

  return userRecords[0];
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const guestId = parseGuestId(opts.req.headers);
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders, guestId };
  try {
    ctx.user = await getAuthenticatedUser(opts.req);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
