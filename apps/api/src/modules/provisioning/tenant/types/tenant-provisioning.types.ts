import {
  AccountStatus,
  InvitationStatus,
  OTPPurpose,
  TenantStatus,
} from "../../../../generated/prisma/client.js";

export type ProvisioningMethod = "INVITATION" | "DIRECT_CREDENTIALS";

export interface ProvisionSchoolAdminInvitePayload {
  readonly tenantName: string;
  readonly tenantId?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface ProvisionSchoolAdminDirectPayload {
  readonly tenantName: string;
  readonly tenantId?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
}

export interface ProvisionSchoolAdminPayload {
  readonly method: ProvisioningMethod;
  readonly tenantName: string;
  readonly tenantId?: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
}

export interface ProvisionedUserRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly username: string;
  readonly email: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: AccountStatus;
  readonly emailVerified: boolean;
  readonly roles: readonly string[];
  readonly membershipId: string;
}

export interface ProvisionSchoolAdminResult {
  readonly method: ProvisioningMethod;
  readonly user: ProvisionedUserRecord;
  readonly credentials?: {
    readonly username: string;
    readonly tempPassword: string;
  };
  readonly invitation?: {
    readonly id: string;
    readonly email: string;
    readonly expiresAt: Date;
    readonly otpCode?: string;
  };
  readonly message: string;
}

export interface CreateProvisionedUserData {
  readonly tenantId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly username: string;
  readonly passwordHash?: string | null;
  readonly emailVerified: boolean;
  readonly status: AccountStatus;
  readonly roleId: string;
  readonly createdById?: string;
  readonly otp?: {
    readonly codeHash: string;
    readonly expiresAt: Date;
    readonly purpose: OTPPurpose;
  };
  readonly invitation?: {
    readonly tokenHash: string;
    readonly expiresAt: Date;
    readonly createdById: string;
    readonly status?: InvitationStatus;
  };
}

export interface TenantAdminInfo {
  readonly id: string;
  readonly username: string;
  readonly email: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: AccountStatus;
  readonly emailVerified: boolean;
}

export interface TenantListItem {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: TenantStatus;
  readonly admin?: TenantAdminInfo;
  readonly totalTeachers: number;
  readonly totalStudents: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TenantQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: TenantStatus;
}

export interface PaginatedTenantResult {
  readonly data: readonly TenantListItem[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}
