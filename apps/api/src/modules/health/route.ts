import { Router } from "express";
import { redis } from "../../lib/redis.js";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [redisPing, dbPing] = await Promise.all([
      redis.ping().catch(() => null),
      prisma.$queryRaw`SELECT 1`.catch(() => null),
    ]);

    const isHealthy = redisPing === "PONG" && dbPing !== null;

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "healthy" : "unhealthy",
      services: {
        redis: redisPing === "PONG" ? "up" : "down",
        database: dbPing !== null ? "up" : "down",
      },
      timestamp: new Date().toISOString(),
    });
  })
);

export { router as healthRouter };
