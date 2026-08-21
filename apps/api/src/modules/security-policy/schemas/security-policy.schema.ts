import { z } from "zod";

export const updateSecurityPolicySchema = z.object({
  minPasswordLength: z.number().int().min(8).max(64).optional(),
  maxPasswordLength: z.number().int().min(16).max(256).optional(),
  requireUppercase: z.boolean().optional(),
  requireLowercase: z.boolean().optional(),
  requireNumbers: z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
  passwordExpiryDays: z.number().int().min(0).max(365).optional(),
  forcePasswordChangeAfterReset: z.boolean().optional(),

  maxFailedAttempts: z.number().int().min(3).max(20).optional(),
  failedAttemptWindowMinutes: z.number().int().min(1).max(1440).optional(),
  lockoutDurationMinutes: z.number().int().min(1).max(1440).optional(),

  otpEnabled: z.boolean().optional(),
  otpExpiryMinutes: z.number().int().min(1).max(60).optional(),
  otpMaxAttempts: z.number().int().min(1).max(10).optional(),
  otpResendCooldownSeconds: z.number().int().min(10).max(300).optional(),
  otpMaxResendPerHour: z.number().int().min(1).max(50).optional(),
  requireOtpForLogin: z.boolean().optional(),
  requireOtpForEmailChange: z.boolean().optional(),
  requireOtpForVerification: z.boolean().optional(),

  accessTokenExpiryMinutes: z.number().int().min(1).max(1440).optional(),
  refreshTokenExpiryDays: z.number().int().min(1).max(90).optional(),
  maxConcurrentSessions: z.number().int().min(1).max(50).optional(),
  sessionTimeoutMinutes: z.number().int().min(1).max(1440).optional(),
  revokeSessionsOnPasswordChange: z.boolean().optional(),

  detectSuspiciousLogin: z.boolean().optional(),
  notifyOnNewDevice: z.boolean().optional(),
  allowGoogleAuth: z.boolean().optional(),
});

export type UpdateSecurityPolicyDto = z.infer<typeof updateSecurityPolicySchema>;
