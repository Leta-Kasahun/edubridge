import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 5000,
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  BREVO_API_KEY: process.env.BREVO_API_KEY ?? "",
  EMAIL_FROM: process.env.EMAIL_FROM ?? "",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ?? "edubridge",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? "",
} as const;

export type Env = typeof env;
