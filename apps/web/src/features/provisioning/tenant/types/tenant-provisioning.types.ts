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

export interface ProvisionedUser {
  id: string;
  tenantId: string;
  tenantName: string;
  username: string;
  email: string | null;
  firstName: string;
  lastName: string;
  status: string;
  emailVerified: boolean;
  roles: string[];
  membershipId: string;
}

export interface ProvisionSchoolAdminResult {
  method: ProvisioningMethod;
  user: ProvisionedUser;
  credentials?: {
    username: string;
    tempPassword: string;
  };
  invitation?: {
    id: string;
    email: string;
    expiresAt: string;
    otpCode?: string;
  };
  message: string;
}

export interface RegenerateCredentialsPayload {
  userId: string;
}

export interface RegenerateCredentialsResult {
  username: string;
  tempPassword: string;
  message: string;
}
