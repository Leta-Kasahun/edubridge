import { CorsOptions } from "cors";
import { securityConfig } from "./security.js";

export const corsConfig: CorsOptions = {
  origin: securityConfig.cors.origin,
  credentials: securityConfig.cors.credentials,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-tenant-id"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

export type { CorsOptions };
