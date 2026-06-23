import { activityLog } from "@db/schema";
import { getDb } from "../queries/connection";
import { getClientIp } from "./security";

type AuditLogInput = {
  userId?: number | null;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: Record<string, unknown>;
  req?: Request;
};

export async function writeAuditLog(input: AuditLogInput) {
  try {
    await getDb().insert(activityLog).values({
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.req ? getClientIp(input.req.headers) : undefined,
      userAgent: input.req?.headers.get("user-agent") || undefined,
    });
  } catch (error) {
    console.warn("[audit] Failed to write audit log", error);
  }
}
