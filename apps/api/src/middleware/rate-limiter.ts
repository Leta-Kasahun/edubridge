import rateLimit, { Options } from "express-rate-limit";
import { securityConfig } from "../config/security.js";
import { RateLimitError } from "../shared/exceptions/rate-limit-error.js";

export const createRateLimiter = (options: Partial<Options> = {}) => {
  return rateLimit({
    windowMs: options.windowMs ?? securityConfig.rateLimit.windowMs,
    limit: options.limit ?? options.max ?? securityConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: () => {
      throw new RateLimitError(
        typeof options.message === "string" ? options.message : "Too many requests, please try again later"
      );
    },
    ...options,
  });
};

export const apiLimiter = createRateLimiter();

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Too many authentication attempts, please try again later",
});

export const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many OTP requests, please try again later",
});
