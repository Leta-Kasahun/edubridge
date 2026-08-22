import { AccountStatus, InvitationStatus, OTPPurpose } from "../../../../generated/prisma/client.js";

export type ProvisioningMethod = "INVITATION" | "DIRECT_CREDENTIALS";

export interface ProvisionSchoolAdminInvitePayload {
  tenantName: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProvisionSchoolAdminDirectPayload {
  tenantName: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ProvisionSchoolAdminPayload {
  method: ProvisioningMethod;
  tenantName: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ProvisionedUserRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  status: AccountStatus;
  emailVerified: boolean;
  roles: string[];
  membershipId: string;
}

export interface ProvisionSchoolAdminResult {
  method: ProvisioningMethod;
  user: ProvisionedUserRecord;
  credentials?: {
    username: string;
    tempPassword: string;
  };
  invitation?: {
    id: string;
    email: string;
    expiresAt: Date;
    otpCode?: string;
  };
  message: string;
}

export interface CreateProvisionedUserData {
  tenantId: string;
  firstName: string;
  lastName: string;
  email?: string;
  username: string;
  passwordHash?: string | null;
  emailVerified: boolean;
  status: AccountStatus;
  roleId: string;
  createdById?: string;
  otp?: {
    codeHash: string;
    expiresAt: Date;
    purpose: OTPPurpose;
  };
  invitation?: {
    tokenHash: string;
    expiresAt: Date;
    createdById: string;
    status?: InvitationStatus;
  };
}
