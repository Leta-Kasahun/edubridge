import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
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
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "43200m",
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
  B2_ENDPOINT: (process.env.B2_ENDPOINT ?? process.env.S3_ENDPOINT ?? "").trim(),
  B2_BUCKET_NAME: (process.env.B2_BUCKET_NAME ?? process.env.S3_BUCKET_NAME ?? "").trim(),
  B2_KEY_ID: (process.env.B2_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? "").trim(),
  B2_APPLICATION_KEY: (process.env.B2_APPLICATION_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? "").trim(),
  B2_REGION: (process.env.B2_REGION ?? process.env.AWS_REGION ?? "").trim(),
  B2_PUBLIC_URL_PREFIX: (process.env.B2_PUBLIC_URL_PREFIX ?? "").trim(),
  FRONTEND_URL: (process.env.FRONTEND_URL ?? "").trim(),
} as const;

export type Env = typeof env;
