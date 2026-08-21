export interface SecurityPolicy {
  id?: string;
  tenantId: string;

  minPasswordLength: number;
  maxPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  forcePasswordChangeAfterReset: boolean;

  maxFailedAttempts: number;
  failedAttemptWindowMinutes: number;
  lockoutDurationMinutes: number;

  otpEnabled: boolean;
  otpExpiryMinutes: number;
  otpMaxAttempts: number;
  otpResendCooldownSeconds: number;
  otpMaxResendPerHour: number;
  requireOtpForLogin: boolean;
  requireOtpForEmailChange: boolean;
  requireOtpForVerification: boolean;

  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
  revokeSessionsOnPasswordChange: boolean;

  detectSuspiciousLogin: boolean;
  notifyOnNewDevice: boolean;
  allowGoogleAuth: boolean;
}

export type UpdateSecurityPolicyInput = Partial<Omit<SecurityPolicy, "id" | "tenantId">>;
