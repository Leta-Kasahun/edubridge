import { CookieOptions } from "express";
import { env } from "./env.js";

export const jwtConfig = {
  accessSecret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  } satisfies CookieOptions,
  refreshCookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } satisfies CookieOptions,
} as const;

export type JwtConfig = typeof jwtConfig;
