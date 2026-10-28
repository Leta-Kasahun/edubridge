import { Request, Response, NextFunction } from "express";
import { redis, RedisKeys } from "../../../lib/redis.js";
import { AI_CONSTANTS } from "../../../shared/constants/ai.constants.js";
import { RateLimitError } from "../../../shared/exceptions/rate-limit-error.js";

export async function requireGenerationRateLimit(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) {
    return next();
  }

  const key = RedisKeys.ai.generationRateLimit(tenantId, userId);
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, AI_CONSTANTS.RATE_LIMIT_WINDOW_SECONDS);
    }
    if (current > AI_CONSTANTS.MAX_GENERATION_RPH) {
      throw new RateLimitError(
        "AI generation rate limit exceeded. Please try again later."
      );
    }
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return next(error);
    }
    next();
  }
}

export async function requireExplanationRateLimit(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) {
    return next();
  }

  const key = RedisKeys.ai.explanationRateLimit(tenantId, userId);
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, AI_CONSTANTS.RATE_LIMIT_WINDOW_SECONDS);
    }
    if (current > AI_CONSTANTS.MAX_EXPLANATION_RPH) {
      throw new RateLimitError(
        "AI explanation rate limit exceeded. Please try again later."
      );
    }
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      return next(error);
    }
    next();
  }
}
