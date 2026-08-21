import { Request, Response, NextFunction } from "express";
import { prisma, tenantStorage } from "../lib/prisma.js";
import { TenantStatus, MembershipStatus } from "../shared/enums/index.js";
import { UUID_REGEX, IGNORED_SUBDOMAINS } from "../shared/constants/index.js";
import { BadRequestError } from "../shared/exceptions/bad-request-error.js";
import { NotFoundError } from "../shared/exceptions/not-found-error.js";
import { ForbiddenError } from "../shared/exceptions/forbidden-error.js";

export interface ResolvedTenant {
  id: string;
  name: string;
  code: string;
  status: TenantStatus;
}

const extractSubdomain = (hostname: string): string | null => {
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0]?.toLowerCase().trim();
    if (subdomain && !IGNORED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }
  return null;
};

export const resolveTenantIdentifier = (req: Request): string | undefined => {
  if (req.user?.tenantId) {
    return req.user.tenantId;
  }

  const headerId = req.headers["x-tenant-id"];
  if (typeof headerId === "string" && headerId.trim().length > 0) {
    return headerId.trim();
  }
  if (Array.isArray(headerId) && headerId[0]?.trim()) {
    return headerId[0].trim();
  }

  const headerCode = req.headers["x-tenant-code"];
  if (typeof headerCode === "string" && headerCode.trim().length > 0) {
    return headerCode.trim();
  }

  const paramId = req.params["tenantId"] || req.params["tenantCode"];
  if (typeof paramId === "string" && paramId.trim().length > 0) {
    return paramId.trim();
  }

  const subdomain = extractSubdomain(req.hostname || req.headers.host || "");
  if (subdomain) {
    return subdomain;
  }

  return undefined;
};

export const findTenantByIdentifier = async (identifier: string): Promise<ResolvedTenant | null> => {
  const isUuid = UUID_REGEX.test(identifier);
  return prisma.tenant.findUnique({
    where: isUuid ? { id: identifier } : { code: identifier },
    select: {
      id: true,
      name: true,
      code: true,
      status: true,
    },
  });
};

export const validateTenantMembership = async (tenantId: string, userId: string): Promise<boolean> => {
  const membership = await prisma.tenantMembership.findFirst({
    where: {
      tenantId,
      userId,
    },
    select: {
      status: true,
    },
  });

  return membership?.status === MembershipStatus.ACTIVE;
};

const bindTenantContext = (req: Request, tenant: ResolvedTenant, next: NextFunction): void => {
  const isSystemAdmin = req.user?.roles.includes("SYSTEM_ADMIN") ?? false;
  req.tenantId = tenant.id;

  tenantStorage.run(
    {
      tenantId: tenant.id,
      userId: req.user?.userId,
      isSystemAdmin,
    },
    () => {
      next();
    }
  );
};

export const requireTenant = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const identifier = resolveTenantIdentifier(req);

  if (!identifier) {
    throw new BadRequestError("Tenant context identifier is required", "TENANT_REQUIRED");
  }

  const tenant = await findTenantByIdentifier(identifier);

  if (!tenant) {
    throw new NotFoundError("Tenant not found", "TENANT_NOT_FOUND");
  }

  if (tenant.status !== TenantStatus.ACTIVE) {
    throw new ForbiddenError("Tenant is inactive or suspended", "TENANT_SUSPENDED");
  }

  const isSystemAdmin = req.user?.roles.includes("SYSTEM_ADMIN") ?? false;

  if (req.user && !isSystemAdmin) {
    const isMemberActive = await validateTenantMembership(tenant.id, req.user.userId);
    if (!isMemberActive) {
      throw new ForbiddenError("User is not an active member of this tenant", "MEMBERSHIP_FORBIDDEN");
    }
  }

  bindTenantContext(req, tenant, next);
};

export const optionalTenant = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const identifier = resolveTenantIdentifier(req);

  if (!identifier) {
    next();
    return;
  }

  const tenant = await findTenantByIdentifier(identifier);

  if (!tenant || tenant.status !== TenantStatus.ACTIVE) {
    next();
    return;
  }

  bindTenantContext(req, tenant, next);
};
