import { Request } from "express";

export function getTenantId(req: Request): string | null {
  const customReq = req as Request & {
    tenantId?: string;
    user?: { tenantId?: string };
  };
  return customReq.tenantId || customReq.user?.tenantId || null;
}
