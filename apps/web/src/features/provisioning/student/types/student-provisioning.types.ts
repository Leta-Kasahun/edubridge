export type StudentGender = "MALE" | "FEMALE";

export type StudentAccountStatus =
  | "PENDING_FIRST_LOGIN"
  | "ACTIVE"
  | "SUSPENDED"
  | "LOCKED"
  | "DEACTIVATED";

export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "GRADUATED"
  | "TRANSFERRED"
  | "WITHDRAWN"
  | "SUSPENDED";

export interface SingleStudentProvisionPayload {
  readonly tenantId?: string;
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly sectionId?: string;
  readonly sectionName?: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string;
  readonly gender: StudentGender;
  readonly studentCode?: string;
  readonly dateOfBirth?: string | Date;
  readonly email?: string;
  readonly nationality?: string;
}

export interface StudentImportRowData {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName?: string;
  readonly gender: StudentGender;
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

export interface StudentRecord {
  readonly id: string;
  readonly studentProfileId: string;
  readonly tenantId: string;
  readonly studentCode: string;
  readonly username: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string | null;
  readonly gender: StudentGender;
  readonly dateOfBirth: string | Date | null;
  readonly status: StudentAccountStatus | string;
  readonly studentStatus: StudentStatus | string;
  readonly membershipId: string;
  readonly enrollment?: {
    readonly id: string;
    readonly academicYearId: string;
    readonly sectionId: string;
    readonly sectionName: string;
    readonly gradeLevel: number;
    readonly status: string;
  };
  readonly createdAt?: string | Date;
}

export interface StudentProvisionResult {
  readonly student: StudentRecord;
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
  readonly status: string;
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly totalRows: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly successfulStudents: readonly StudentProvisionResult[];
  readonly failedRows: readonly StudentBulkRowError[];
  readonly message: string;
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

export interface StudentQueryFilters {
  readonly academicYearId?: string;
  readonly gradeId?: string;
  readonly sectionId?: string;
  readonly search?: string;
  readonly accountStatus?: string;
  readonly status?: string;
  readonly gender?: StudentGender;
  readonly page?: number;
  readonly limit?: number;
}

export interface StudentPaginatedResponse {
  readonly data: readonly StudentRecord[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}
