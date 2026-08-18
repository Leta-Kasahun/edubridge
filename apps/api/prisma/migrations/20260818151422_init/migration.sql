-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_FIRST_LOGIN', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LEFT');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED', 'SUSPICIOUS');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('WEB', 'MOBILE', 'TABLET', 'DESKTOP_APP');

-- CreateEnum
CREATE TYPE "FailureReason" AS ENUM ('INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_DEACTIVATED', 'IP_BLOCKED', 'RATE_LIMITED', 'OTP_REQUIRED', 'OTP_INVALID', 'OTP_EXPIRED');

-- CreateEnum
CREATE TYPE "OTPPurpose" AS ENUM ('LOGIN_2FA', 'EMAIL_VERIFICATION', 'EMAIL_CHANGE', 'PASSWORD_RESET', 'INVITATION_ACCEPT');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('BRUTE_FORCE_DETECTED', 'ACCOUNT_LOCKED', 'NEW_DEVICE', 'NEW_LOCATION', 'IMPOSSIBLE_TRAVEL', 'SUSPICIOUS_LOGIN', 'REFRESH_TOKEN_REUSE', 'PASSWORD_CHANGED', 'PASSWORD_RESET', 'OTP_FAILED', 'SESSION_REVOKED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "LookupCategory" AS ENUM ('POLICY', 'FEATURE', 'SETTING', 'SECURITY', 'NOTIFICATION', 'INTEGRATION', 'CUSTOM');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "googleId" TEXT,
    "passwordHash" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_FIRST_LOGIN',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "pendingEmail" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantMembership" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "MembershipRole" (
    "membershipId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "MembershipRole_pkey" PRIMARY KEY ("membershipId","roleId")
);

-- CreateTable
CREATE TABLE "Lookup" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "category" "LookupCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lookup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityPolicy" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "minPasswordLength" INTEGER NOT NULL DEFAULT 12,
    "maxPasswordLength" INTEGER NOT NULL DEFAULT 128,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requireLowercase" BOOLEAN NOT NULL DEFAULT true,
    "requireNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requireSpecialChars" BOOLEAN NOT NULL DEFAULT true,
    "passwordExpiryDays" INTEGER NOT NULL DEFAULT 0,
    "forcePasswordChangeAfterReset" BOOLEAN NOT NULL DEFAULT true,
    "maxFailedAttempts" INTEGER NOT NULL DEFAULT 5,
    "failedAttemptWindowMinutes" INTEGER NOT NULL DEFAULT 15,
    "lockoutDurationMinutes" INTEGER NOT NULL DEFAULT 15,
    "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "otpExpiryMinutes" INTEGER NOT NULL DEFAULT 5,
    "otpMaxAttempts" INTEGER NOT NULL DEFAULT 5,
    "otpResendCooldownSeconds" INTEGER NOT NULL DEFAULT 30,
    "otpMaxResendPerHour" INTEGER NOT NULL DEFAULT 5,
    "requireOtpForLogin" BOOLEAN NOT NULL DEFAULT false,
    "requireOtpForEmailChange" BOOLEAN NOT NULL DEFAULT true,
    "requireOtpForVerification" BOOLEAN NOT NULL DEFAULT true,
    "accessTokenExpiryMinutes" INTEGER NOT NULL DEFAULT 15,
    "refreshTokenExpiryDays" INTEGER NOT NULL DEFAULT 7,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 5,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 60,
    "revokeSessionsOnPasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "detectSuspiciousLogin" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnNewDevice" BOOLEAN NOT NULL DEFAULT true,
    "allowGoogleAuth" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OTPPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "deviceId" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'WEB',
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "userId" UUID,
    "identifier" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" "FailureReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "userId" UUID,
    "sessionId" UUID,
    "type" "SecurityEventType" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "ipAddress" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" UUID,
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" UUID,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "TenantMembership_userId_idx" ON "TenantMembership"("userId");

-- CreateIndex
CREATE INDEX "TenantMembership_tenantId_status_idx" ON "TenantMembership"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Role_tenantId_isActive_idx" ON "Role"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_code_key" ON "Role"("tenantId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resource_action_key" ON "Permission"("resource", "action");

-- CreateIndex
CREATE INDEX "MembershipRole_roleId_idx" ON "MembershipRole"("roleId");

-- CreateIndex
CREATE INDEX "Lookup_tenantId_category_idx" ON "Lookup"("tenantId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Lookup_tenantId_category_key_key" ON "Lookup"("tenantId", "category", "key");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityPolicy_tenantId_key" ON "SecurityPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "OTPCode_userId_purpose_idx" ON "OTPCode"("userId", "purpose");

-- CreateIndex
CREATE INDEX "OTPCode_expiresAt_idx" ON "OTPCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_status_idx" ON "Session"("userId", "status");

-- CreateIndex
CREATE INDEX "Session_tenantId_userId_status_idx" ON "Session"("tenantId", "userId", "status");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifier_createdAt_idx" ON "LoginAttempt"("identifier", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_createdAt_idx" ON "LoginAttempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_createdAt_idx" ON "LoginAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_riskLevel_isResolved_idx" ON "SecurityEvent"("riskLevel", "isResolved");

-- CreateIndex
CREATE INDEX "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_tokenHash_key" ON "Invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "Invitation_tenantId_email_idx" ON "Invitation"("tenantId", "email");

-- CreateIndex
CREATE INDEX "Invitation_expiresAt_idx" ON "Invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "Invitation_createdById_idx" ON "Invitation"("createdById");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRole" ADD CONSTRAINT "MembershipRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lookup" ADD CONSTRAINT "Lookup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityPolicy" ADD CONSTRAINT "SecurityPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
