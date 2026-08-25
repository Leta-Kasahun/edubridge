export type TenantStatus = "ACTIVE" | "SUSPENDED";

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

export interface ProvisionedUser {
  readonly id: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly username: string;
  readonly email: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: string;
  readonly emailVerified: boolean;
  readonly roles: readonly string[];
  readonly membershipId: string;
}

export interface ProvisionSchoolAdminResult {
  readonly method: ProvisioningMethod;
  readonly user: ProvisionedUser;
  readonly credentials?: {
    readonly username: string;
    readonly tempPassword: string;
  };
  readonly invitation?: {
    readonly id: string;
    readonly email: string;
    readonly expiresAt: string;
    readonly otpCode?: string;
  };
  readonly message: string;
}

export interface RegenerateCredentialsPayload {
  readonly userId: string;
}

export interface RegenerateCredentialsResult {
  readonly username: string;
  readonly tempPassword: string;
  readonly message: string;
}

export interface TenantAdminInfo {
  readonly id: string;
  readonly username: string;
  readonly email: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: string;
  readonly emailVerified: boolean;
}

export interface TenantRecord {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: TenantStatus;
  readonly admin?: TenantAdminInfo;
  readonly totalTeachers: number;
  readonly totalStudents: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TenantQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: TenantStatus;
}

export interface TenantPaginatedResponse {
  readonly data: readonly TenantRecord[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}
