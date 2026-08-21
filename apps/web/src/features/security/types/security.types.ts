export interface SecurityPolicy {
  readonly id?: string;
  readonly tenantId?: string;

  readonly minPasswordLength: number;
  readonly maxPasswordLength: number;
  readonly requireUppercase: boolean;
  readonly requireLowercase: boolean;
  readonly requireNumbers: boolean;
  readonly requireSpecialChars: boolean;
  readonly passwordExpiryDays: number;
  readonly forcePasswordChangeAfterReset: boolean;

  readonly maxFailedAttempts: number;
  readonly failedAttemptWindowMinutes: number;
  readonly lockoutDurationMinutes: number;

  readonly otpEnabled: boolean;
  readonly otpExpiryMinutes: number;
  readonly otpMaxAttempts: number;
  readonly otpResendCooldownSeconds: number;
  readonly otpMaxResendPerHour: number;
  readonly requireOtpForLogin: boolean;
  readonly requireOtpForEmailChange: boolean;
  readonly requireOtpForVerification: boolean;

  readonly accessTokenExpiryMinutes: number;
  readonly refreshTokenExpiryDays: number;
  readonly maxConcurrentSessions: number;
  readonly sessionTimeoutMinutes: number;
  readonly revokeSessionsOnPasswordChange: boolean;

  readonly detectSuspiciousLogin: boolean;
  readonly notifyOnNewDevice: boolean;
  readonly allowGoogleAuth: boolean;
}

export type UpdateSecurityPolicyPayload = Partial<Omit<SecurityPolicy, "id" | "tenantId">>;
