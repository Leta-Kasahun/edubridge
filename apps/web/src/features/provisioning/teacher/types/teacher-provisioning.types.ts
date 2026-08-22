export type TeacherGender = "MALE" | "FEMALE";

export type TeacherStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "TRANSFERRED"
  | "RESIGNED"
  | "SUSPENDED";

export type TeacherProvisioningMethod = "INVITATION" | "DIRECT_CREDENTIALS";

export interface SingleTeacherProvisionInvitePayload {
  readonly tenantId?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: TeacherGender;
  readonly email: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface SingleTeacherProvisionDirectPayload {
  readonly tenantId?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: TeacherGender;
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
  readonly gender: TeacherGender;
  readonly email?: string;
  readonly phoneNumber?: string;
  readonly employeeCode?: string;
}

export interface TeacherImportRowData {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: TeacherGender;
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

export interface TeacherRecord {
  readonly id: string;
  readonly teacherProfileId: string;
  readonly tenantId: string;
  readonly username: string;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: TeacherGender;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly status: string;
  readonly teacherStatus: TeacherStatus;
  readonly emailVerified: boolean;
  readonly membershipId: string;
}

export interface TeacherProvisionResult {
  readonly method: TeacherProvisioningMethod;
  readonly teacher: TeacherRecord;
  readonly credentials?: {
    readonly username: string;
    readonly tempPassword: string;
  };
  readonly invitation?: {
    readonly id: string;
    readonly email: string;
    readonly expiresAt: string | Date;
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
  readonly status: string;
  readonly totalRows: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly successfulTeachers: readonly TeacherProvisionResult[];
  readonly failedRows: readonly TeacherBulkRowError[];
  readonly message: string;
}

export interface TeacherQueryFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly status?: TeacherStatus;
  readonly gender?: TeacherGender;
}

export interface TeacherPaginatedResponse {
  readonly data: readonly TeacherRecord[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}

export interface UpdateTeacherPayload {
  readonly firstName?: string;
  readonly middleName?: string;
  readonly lastName?: string;
  readonly gender?: TeacherGender;
  readonly phoneNumber?: string;
  readonly email?: string;
  readonly status?: TeacherStatus;
}
