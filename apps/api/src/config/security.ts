import { env } from "./env.js";

export const defaultSecurityPolicy = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiryDays: 0,
  forcePasswordChangeAfterReset: true,
  maxFailedAttempts: 5,
  failedAttemptWindowMinutes: 15,
  lockoutDurationMinutes: 15,
  otpEnabled: false,
  otpExpiryMinutes: 5,
  otpMaxAttempts: 5,
  otpResendCooldownSeconds: 30,
  otpMaxResendPerHour: 5,
  requireOtpForLogin: false,
  requireOtpForEmailChange: true,
  requireOtpForVerification: true,
  accessTokenExpiryMinutes: 15,
  refreshTokenExpiryDays: 7,
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 60,
  revokeSessionsOnPasswordChange: true,
  detectSuspiciousLogin: true,
  notifyOnNewDevice: true,
  allowGoogleAuth: true,
} as const;

export const securityConfig = {
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  },
  cors: {
    origin: env.CORS_ORIGIN.includes(",") ? env.CORS_ORIGIN.split(",") : env.CORS_ORIGIN,
    credentials: true,
  },
  helmet: {
    contentSecurityPolicy: env.NODE_ENV === "production",
  },
  policyDefaults: defaultSecurityPolicy,
} as const;

export type SecurityConfig = typeof securityConfig;
export type DefaultSecurityPolicy = typeof defaultSecurityPolicy;
