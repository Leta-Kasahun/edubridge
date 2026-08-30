import { AcademicYearStatus } from "../../../../generated/prisma/client.js";

export type { AcademicYearStatus };

export interface AcademicYearRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly code: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: AcademicYearStatus;
  readonly sectionCount: number;
  readonly studentEnrollmentCount: number;
  readonly teacherAssignmentCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateAcademicYearInput {
  readonly name: string;
  readonly code: string;
  readonly startDate: Date | string;
  readonly endDate: Date | string;
  readonly status?: AcademicYearStatus;
}

export interface UpdateAcademicYearInput {
  readonly name?: string;
  readonly code?: string;
  readonly startDate?: Date | string;
  readonly endDate?: Date | string;
  readonly status?: AcademicYearStatus;
}

export interface AcademicYearFilterParams {
  readonly tenantId?: string;
  readonly search?: string;
  readonly status?: AcademicYearStatus;
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedAcademicYearsResult {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly data: readonly AcademicYearRecord[];
}
