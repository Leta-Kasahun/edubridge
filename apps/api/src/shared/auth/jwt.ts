import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../../config/jwt.js";
import { UnauthorizedError } from "../exceptions/unauthorized-error.js";

export interface AccessTokenPayload {
  userId: string;
  tenantId?: string;
  email?: string;
  roles?: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export const signAccessToken = (
  payload: AccessTokenPayload,
  expiresIn: string | number = jwtConfig.accessExpiresIn
): string => {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, jwtConfig.accessSecret, options);
};

export const signRefreshToken = (
  payload: RefreshTokenPayload,
  expiresIn: string | number = jwtConfig.refreshExpiresIn
): string => {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, jwtConfig.refreshSecret, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.accessSecret) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

export const decodeToken = <T>(token: string): T | null => {
  return (jwt.decode(token) as T) || null;
};
