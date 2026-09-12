import { Request, Response } from "express";
import { RedisKeys, createRedisClient } from "../../../lib/redis.js";
import { verifyAccessToken } from "../../../shared/auth/jwt.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";

const HEARTBEAT_INTERVAL_MS = 25_000;

export const sseHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let userId: string;
    let tenantId: string;

    const raw =
      (req.query["token"] as string | undefined) ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!raw) {
      res
        .status(401)
        .json({ success: false, message: "Authentication token is missing" });
      return;
    }

    try {
      const payload = verifyAccessToken(raw);
      userId = payload.userId;
      tenantId = payload.tenantId ?? "";
    } catch {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("connected", { userId, tenantId });

    const heartbeat = setInterval(() => {
      res.write(`: heartbeat\n\n`);
    }, HEARTBEAT_INTERVAL_MS);

    const subscriber = createRedisClient();
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
        // Ignore malformed or unparseable JSON messages
      }
    });

    const cleanup = () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe(channel).catch(() => {});
      subscriber.quit().catch(() => {});
    };

    req.on("close", cleanup);
    req.on("aborted", cleanup);
  }
);
