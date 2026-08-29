import {
  AccountStatus,
  Gender,
  StudentStatus,
  EnrollmentStatus,
  ImportBatchStatus,
  ImportRowStatus,
  ImportSource,
} from "../../../../generated/prisma/client.js";

export interface SingleStudentProvisionPayload {
  readonly tenantId?: string;
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly sectionId?: string;
  readonly sectionName?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string;
  readonly gender: Gender;
  readonly studentCode?: string;
  readonly dateOfBirth?: Date | string;
  readonly email?: string;
  readonly nationality?: string;
}

export interface StudentImportRowData {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string;
  readonly gender: Gender;
  readonly section: string;
  readonly studentCode?: string;
  readonly email?: string;
  readonly dateOfBirth?: string;
}

export interface BulkStudentCsvPayload {
  readonly tenantId?: string;
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly csvContent: string;
  readonly fileName?: string;
}

export interface ProvisionedStudentRecord {
  readonly id: string;
  readonly studentProfileId: string;
  readonly tenantId: string;
  readonly studentCode: string;
  readonly username: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string | null;
  readonly gender: Gender;
  readonly dateOfBirth: Date | null;
  readonly status: AccountStatus;
  readonly studentStatus: StudentStatus;
  readonly membershipId: string;
  readonly enrollment?: {
    readonly id: string;
    readonly academicYearId: string;
    readonly sectionId: string;
    readonly sectionName: string;
    readonly gradeLevel: number;
    readonly status: EnrollmentStatus;
  };
  readonly createdAt?: Date;
}

export interface StudentProvisionResult {
  readonly student: ProvisionedStudentRecord;
  readonly credentials: {
    readonly username: string;
    readonly tempPassword: string;
  };
  readonly enrollment: {
    readonly academicYearId: string;
    readonly sectionId: string;
    readonly sectionName: string;
    readonly gradeLevel: number;
  };
  readonly message: string;
}

export interface StudentBulkRowError {
  readonly rowNumber: number;
  readonly raw: Record<string, string>;
  readonly errors: readonly string[];
}

export interface StudentBulkProvisionResult {
  readonly batchId: string;
  readonly status: ImportBatchStatus;
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly totalRows: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly successfulStudents: readonly StudentProvisionResult[];
  readonly failedRows: readonly StudentBulkRowError[];
  readonly message: string;
}

export interface CreateProvisionedStudentData {
  readonly tenantId: string;
  readonly academicYearId: string;
  readonly sectionId: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string;
  readonly gender: Gender;
  readonly studentCode: string;
  readonly username: string;
  readonly passwordHash?: string | null;
  readonly dateOfBirth?: Date;
  readonly email?: string;
  readonly nationality?: string;
  readonly roleId: string;
  readonly createdById?: string;
}

export interface StudentQueryFilters {
  readonly academicYearId?: string;
  readonly gradeId?: string;
  readonly sectionId?: string;
  readonly search?: string;
  readonly status?: StudentStatus;
  readonly accountStatus?: AccountStatus;
  readonly gender?: Gender;
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedStudentResult {
  readonly data: readonly ProvisionedStudentRecord[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}

export interface AcademicStructureSection {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly capacity?: number | null;
  readonly studentCount: number;
}

export interface AcademicStructureGrade {
  readonly id: string;
  readonly level: number;
  readonly studentCount: number;
  readonly sections: readonly AcademicStructureSection[];
}

export interface AcademicStructureAcademicYear {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: string;
  readonly isCurrent: boolean;
  readonly grades: readonly AcademicStructureGrade[];
}

export interface AcademicStructureResponse {
  readonly academicYears: readonly AcademicStructureAcademicYear[];
  readonly currentAcademicYear?: AcademicStructureAcademicYear;
}

export interface CreateStudentImportBatchInput {
  readonly tenantId: string;
  readonly createdById: string;
  readonly totalRows: number;
  readonly source: ImportSource;
  readonly fileName?: string;
}

export interface CreateStudentImportRowInput {
  readonly rowNumber: number;
  readonly status: ImportRowStatus;
  readonly data: Record<string, unknown>;
  readonly errors?: readonly string[];
  readonly resultId?: string;
}
