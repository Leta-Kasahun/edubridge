import { app } from "./app.js";
import { env } from "./config/env.js";
import { redis } from "./lib/redis.js";

const startServer = async () => {
  try {
    await redis.ping();
    process.stdout.write("Redis connected successfully\n");
  } catch {
    process.stdout.write("Redis connection failed\n");
  }

  const server = app.listen(env.PORT, () => {
    process.stdout.write(`Server running on http://localhost:${env.PORT}\n`);
    process.stdout.write(`Swagger docs available at http://localhost:${env.PORT}/api-docs\n`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await redis.quit().catch(() => null);
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

void startServer();
