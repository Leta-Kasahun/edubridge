import {
  AccountStatus,
  Gender,
  TeacherStatus,
  ImportBatchStatus,
  ImportRowStatus,
  ImportSource,
} from "../../../../generated/prisma/client.js";

export type TeacherProvisioningMethod = "INVITATION" | "DIRECT_CREDENTIALS";

export interface SingleTeacherProvisionInvitePayload {
  readonly tenantId?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface SingleTeacherProvisionDirectPayload {
  readonly tenantId?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface SingleTeacherProvisionPayload {
  readonly method: TeacherProvisioningMethod;
  readonly tenantId?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface TeacherImportRowData {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface BulkTeacherProvisionPayload {
  readonly tenantId?: string;
  readonly method: TeacherProvisioningMethod;
  readonly teachers: readonly TeacherImportRowData[];
  readonly sendNotifications?: boolean;
}

export interface BulkTeacherCsvPayload {
  readonly tenantId?: string;
  readonly method: TeacherProvisioningMethod;
  readonly csvContent: string;
  readonly sendNotifications?: boolean;
}

export interface ProvisionedTeacherRecord {
  readonly id: string;
  readonly teacherProfileId: string;
  readonly tenantId: string;
  readonly username: string;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly status: AccountStatus;
  readonly teacherStatus: TeacherStatus;
  readonly emailVerified: boolean;
  readonly membershipId: string;
  readonly createdAt?: Date;
}

export interface TeacherProvisionResult {
  readonly method: TeacherProvisioningMethod;
  readonly teacher: ProvisionedTeacherRecord;
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

export interface TeacherBulkRowError {
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
  readonly errors: readonly string[];
}

export interface TeacherBulkProvisionResult {
  readonly batchId: string;
  readonly status: ImportBatchStatus;
  readonly totalRows: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly successfulTeachers: readonly TeacherProvisionResult[];
  readonly failedRows: readonly TeacherBulkRowError[];
  readonly message: string;
}

export interface CreateProvisionedTeacherData {
  readonly tenantId: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly employeeCode: string;
  readonly username: string;
  readonly passwordHash?: string | null;
  readonly emailVerified: boolean;
  readonly status: AccountStatus;
  readonly roleId: string;
  readonly createdById?: string;
  readonly otp?: {
    readonly codeHash: string;
    readonly expiresAt: Date;
    readonly purpose: "INVITATION_ACCEPT";
  };
  readonly invitation?: {
    readonly tokenHash: string;
    readonly expiresAt: Date;
    readonly createdById: string;
  };
}

export interface TeacherQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: TeacherStatus;
  readonly accountStatus?: AccountStatus;
  readonly academicYearId?: string;
  readonly gender?: Gender;
}

export interface UpdateTeacherProfileData {
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly gender?: Gender;
  readonly dateOfBirth?: Date;
  readonly phoneNumber?: string;
  readonly email?: string;
  readonly status?: TeacherStatus;
}

export interface CreateImportRowInput {
  readonly rowNumber: number;
  readonly status: ImportRowStatus;
  readonly data: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly resultId?: string;
}

export interface PaginatedTeacherResult {
  readonly data: readonly ProvisionedTeacherRecord[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}

export interface CreateImportBatchInput {
  readonly tenantId: string;
  readonly createdById: string;
  readonly totalRows: number;
  readonly source: ImportSource;
  readonly fileName?: string;
}
