import { Request, Response } from "express";
import { Redis } from "ioredis";
import { env } from "../../../config/env.js";
import { RedisKeys } from "../../../lib/redis.js";
import { verifyAccessToken } from "../../../shared/auth/jwt.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";

const HEARTBEAT_INTERVAL_MS = 25_000;

/**
 * GET /api/notifications/stream
 *
 * Opens an SSE connection. Each connection creates a **dedicated** Redis
 * subscriber so every server instance can fan-out independently — this is
 * the standard pattern for horizontally-scalable SSE with Redis Pub/Sub.
 *
 * Auth: token is accepted from Bearer header OR ?token= query param
 *       (browsers cannot set custom headers for EventSource).
 */
export const sseHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let userId: string;
  let tenantId: string;

  const raw =
    (req.query["token"] as string | undefined) ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!raw) {
    res.status(401).json({ success: false, message: "Authentication token is missing" });
    return;
  }

  try {
    const payload = verifyAccessToken(raw);
    userId = payload.userId;
    tenantId = payload.tenantId ?? "";
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx: disable proxy buffering
  res.flushHeaders();

  // Helper: write a named event
  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  send("connected", { userId, tenantId });

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, HEARTBEAT_INTERVAL_MS);

  // Dedicated subscriber per connection for horizontal scalability
  const subscriber = new Redis(
    env.REDIS_URL || {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      lazyConnect: false,
    }
  );

  const channel = RedisKeys.notification.userChannel(userId);

  try {
    await subscriber.subscribe(channel);
  } catch {
    clearInterval(heartbeat);
    subscriber.quit().catch(() => {});
    res.end();
    return;
  }

  subscriber.on("message", (_ch: string, message: string) => {
    try {
      const payload = JSON.parse(message);
      send("notification", payload);
    } catch {
      // malformed — ignore
    }
  });

  const cleanup = () => {
    clearInterval(heartbeat);
    subscriber.unsubscribe(channel).catch(() => {});
    subscriber.quit().catch(() => {});
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);
});
