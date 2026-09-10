import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { RedisKeys } from "./redis.keys.js";

export const createRedisClient = (): Redis => {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
};

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export { RedisKeys };
export type { Redis };
