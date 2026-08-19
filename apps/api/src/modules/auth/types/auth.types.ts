import {
  DeviceType,
  OTPPurpose,
  AccountStatus,
  SessionStatus,
  FailureReason,
  SecurityEventType,
  RiskLevel,
} from "../../../generated/prisma/client.js";

export type {
  DeviceType,
  OTPPurpose,
  AccountStatus,
  SessionStatus,
  FailureReason,
  SecurityEventType,
  RiskLevel,
};

export interface TokenPayload {
  userId: string;
  tenantId?: string;
  sessionId: string;
  roles: string[];
  deviceId?: string;
  tokenId: string;
  type: "access" | "refresh";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
}

export interface UserAuthProfile {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string;
  lastName: string;
  status: AccountStatus;
  emailVerified: boolean;
  roles: string[];
  tenantId?: string;
  memberships?: Array<{ tenantId: string; tenantName: string; roles: string[] }>;
  currentTenantId?: string;
}

export interface AuthResponse {
  tokens?: AuthTokens;
  user?: UserAuthProfile;
  requiresOtp?: boolean;
  requiresFirstLoginSetup?: boolean;
  userId?: string;
  purpose?: OTPPurpose;
  message?: string;
  suspiciousLogin?: boolean;
  newDevice?: boolean;
}

export interface SessionMetadata {
  deviceId?: string;
  deviceName?: string;
  deviceType?: DeviceType;
  ipAddress: string;
  userAgent?: string;
  location?: string;
}

export interface CreateSessionInput {
  tenantId: string;
  userId: string;
  refreshTokenHash: string;
  deviceId?: string;
  deviceType?: DeviceType;
  ipAddress: string;
  userAgent?: string | null;
  expiresAt: Date;
}

export interface CreateLoginAttemptInput {
  tenantId?: string | null;
  userId?: string | null;
  identifier: string;
  ipAddress: string;
  userAgent?: string | null;
  deviceId?: string | null;
  success: boolean;
  failureReason?: FailureReason | null;
}

export interface CreateSecurityEventInput {
  tenantId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  type: SecurityEventType;
  riskLevel?: RiskLevel;
  ipAddress?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface CreateOtpInput {
  userId: string;
  codeHash: string;
  purpose: OTPPurpose;
  expiresAt: Date;
}

export interface UserRoleRecord {
  role: {
    id: string;
    code: string;
    name: string;
  };
}

export interface UserMembershipRecord {
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    code: string;
  };
  roles: UserRoleRecord[];
}

export interface UserWithMembershipsRecord {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string;
  lastName: string;
  passwordHash: string | null;
  status: AccountStatus;
  emailVerified: boolean;
  lockedUntil: Date | null;
  failedLoginAttempts: number;
  memberships: UserMembershipRecord[];
}
