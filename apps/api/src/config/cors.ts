import { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsConfig: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) {
      callback(null, true);
      return;
    }
    if (env.CORS_ORIGIN === "*" || env.NODE_ENV === "development") {
      callback(null, true);
      return;
    }
    const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim());
    if (allowed.includes(requestOrigin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-tenant-id"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

export type { CorsOptions };
