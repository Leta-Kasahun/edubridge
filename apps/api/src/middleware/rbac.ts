import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { redis, RedisKeys } from "../lib/redis.js";
import { ForbiddenError } from "../shared/exceptions/forbidden-error.js";
import { UnauthorizedError } from "../shared/exceptions/unauthorized-error.js";

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required for role access");
    }

    if (req.user.roles.includes("SYSTEM_ADMIN")) {
      next();
      return;
    }

    const hasRole = allowedRoles.some((role) => req.user?.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenError("Insufficient role permissions", "ROLE_FORBIDDEN");
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required for permission access");
    }

    if (req.user.roles.includes("SYSTEM_ADMIN")) {
      next();
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAll) {
      throw new ForbiddenError("Insufficient granular permissions", "PERMISSION_FORBIDDEN");
    }

    next();
  };
};

export const requirePermission = (actionOrPerm: string, resource?: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required for permission access");
      }

      if (req.user.roles.includes("SYSTEM_ADMIN")) {
        next();
        return;
      }

      const tenantId = (req.tenantId || req.user.tenantId || req.headers["x-tenant-id"]) as string;
      if (!tenantId) {
        throw new ForbiddenError("Tenant context is required", "TENANT_REQUIRED");
      }

      const cacheKey = RedisKeys.permission.userPermissions(tenantId, req.user.userId);
      const cached = await redis.get(cacheKey);

      let userPermissions: string[];

      if (cached) {
        userPermissions = JSON.parse(cached);
      } else {
        const membership = await prisma.tenantMembership.findFirst({
          where: {
            tenantId,
            userId: req.user.userId,
          },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!membership || membership.status !== "ACTIVE") {
          throw new ForbiddenError("Insufficient permissions", "PERMISSION_FORBIDDEN");
        }

        const now = new Date();
        const permissionsSet = new Set<string>();

        for (const membershipRole of membership.roles) {
          if (membershipRole.expiresAt && membershipRole.expiresAt < now) {
            continue;
          }

          const role = membershipRole.role;
          if (!role || !role.isActive) {
            continue;
          }

          for (const rolePerm of role.permissions) {
            if (rolePerm.permission && rolePerm.permission.isActive) {
              permissionsSet.add(
                `${rolePerm.permission.resource.toLowerCase()}:${rolePerm.permission.action.toLowerCase()}`
              );
            }
          }
        }

        userPermissions = Array.from(permissionsSet);
        await redis.set(cacheKey, JSON.stringify(userPermissions), "EX", 300);
      }

      const resName = (resource || actionOrPerm.split(":")[0] || "").toLowerCase();
      const actName = (resource ? actionOrPerm : actionOrPerm.split(":")[1] || "").toLowerCase();

      const hasPermission =
        userPermissions.includes(`${resName}:${actName}`) ||
        userPermissions.includes(`${resName}:*`) ||
        userPermissions.includes(`*:${actName}`) ||
        userPermissions.includes("*:*") ||
        userPermissions.includes("*:manage");

      if (!hasPermission) {
        throw new ForbiddenError("Insufficient permissions", "PERMISSION_FORBIDDEN");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkPermission = requirePermission;
