import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../shared/auth/jwt.js";
import { UnauthorizedError } from "../shared/exceptions/unauthorized-error.js";

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
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

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError("Authentication token is missing");
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

export const optionalAuthenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        tenantId: payload.tenantId,
        email: payload.email,
        roles: payload.roles || [],
      };
    } catch (_error) {
      void _error;
    }
  }
  next();
};
