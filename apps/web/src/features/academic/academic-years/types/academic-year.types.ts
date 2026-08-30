export type AcademicYearStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface AcademicYearItem {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly code: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status: AcademicYearStatus;
  readonly sectionCount: number;
  readonly studentEnrollmentCount: number;
  readonly teacherAssignmentCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateAcademicYearPayload {
  readonly name: string;
  readonly code: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly status?: AcademicYearStatus;
}

export interface UpdateAcademicYearPayload {
  readonly name?: string;
  readonly code?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly status?: AcademicYearStatus;
}

export interface AcademicYearFilters {
  readonly search?: string;
  readonly status?: AcademicYearStatus;
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedAcademicYearsResponse {
  readonly data: readonly AcademicYearItem[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}
