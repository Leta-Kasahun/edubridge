import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../shared/auth/jwt.js";
import { isKeycloakToken, verifyKeycloakToken } from "../shared/auth/keycloak-jwks.js";
import { authRepository } from "../modules/auth/repository/auth.repository.js";
import { UnauthorizedError } from "../shared/exceptions/unauthorized-error.js";

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const queryToken = typeof req.query.token === "string" ? req.query.token.trim() : null;
  if (queryToken) {
    return queryToken;
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
};

const resolveKeycloakUser = async (token: string, req: Request) => {
  const payload = await verifyKeycloakToken(token);
  let user = await authRepository.findByKeycloakId(payload.sub);

  if (!user && payload.email) {
    const existing = await authRepository.findByEmail(payload.email);
    if (existing) {
      await authRepository.linkKeycloakAccount(existing.id, payload.sub);
      user = await authRepository.findById(existing.id);
    }
  }

  if (!user) {
    throw new UnauthorizedError("Keycloak user is not provisioned in EduBridge");
  }

  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED" || user.status === "LOCKED") {
    throw new UnauthorizedError("Account is inactive or suspended");
  }

  const requestedTenantId = (req.headers["x-tenant-id"] as string) || req.tenantId;
  const activeMemberships = user.memberships.filter((m) => m.status === "ACTIVE");
  const membership = requestedTenantId
    ? activeMemberships.find((m) => m.tenantId === requestedTenantId)
    : activeMemberships[0];

  const realmRoles = payload.realm_access?.roles ?? [];
  const dbRoles = membership?.roles.map((r) => r.role.code) ?? [];
  const isSystemAdmin = realmRoles.includes("SYSTEM_ADMIN") || dbRoles.includes("SYSTEM_ADMIN");

  const combinedRoles = Array.from(
    new Set([...(isSystemAdmin ? ["SYSTEM_ADMIN"] : []), ...dbRoles])
  );

  return {
    userId: user.id,
    tenantId: membership?.tenantId,
    email: user.email ?? payload.email,
    roles: combinedRoles,
  };
};

export const authenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError("Authentication token is missing");
  }

  if (isKeycloakToken(token)) {
    req.user = await resolveKeycloakUser(token, req);
    return next();
  }

  const payload = verifyAccessToken(token);
  req.user = {
    userId: payload.userId,
    tenantId: payload.tenantId,
    email: payload.email,
    roles: payload.roles || [],
  };
  next();
};

export const optionalAuthenticate: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (token) {
    try {
      if (isKeycloakToken(token)) {
        req.user = await resolveKeycloakUser(token, req);
      } else {
        const payload = verifyAccessToken(token);
        req.user = {
          userId: payload.userId,
          tenantId: payload.tenantId,
          email: payload.email,
          roles: payload.roles || [],
        };
      }
    } catch (_error) {
      void _error;
    }
  }
  next();
};
