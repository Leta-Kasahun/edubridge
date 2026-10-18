import { Request, Response, NextFunction } from "express";
import { redis, RedisKeys } from "../lib/redis.js";

export const requireIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }

  const idempotencyKey = req.headers["x-idempotency-key"];
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    next();
    return;
  }

  const tenantId = req.user?.tenantId ?? "global";
  const cacheKey = RedisKeys.idempotency.key(tenantId, idempotencyKey);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { statusCode: number; body: unknown };
      res.status(parsed.statusCode).json(parsed.body);
      return;
    }
  } catch {
    next();
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown): Response => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      redis
        .setex(
          cacheKey,
          86400,
          JSON.stringify({ statusCode: res.statusCode, body })
        )
        .catch(() => {});
    }
    return originalJson(body);
  };

  next();
};
