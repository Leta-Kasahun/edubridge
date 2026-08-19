import { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { AUTH_CONSTANTS } from "../constants/auth.constants.js";

export const getRefreshCookieOptions = (
  maxAgeDays: number = AUTH_CONSTANTS.TOKEN.REFRESH_EXPIRY_DAYS
): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
});

export const setRefreshCookie = (
  res: Response,
  refreshToken?: string,
  maxAgeDays?: number
) => {
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions(maxAgeDays));
  }
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie("refreshToken", getRefreshCookieOptions());
};

export const extractRefreshToken = (req: Request): string | undefined => {
  const bodyToken = req.body?.refreshToken as string | undefined;
  if (bodyToken) return bodyToken;

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)refreshToken=([^;]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return undefined;
};
