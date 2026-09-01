import {
  TeacherAssignmentRoleType,
  TeacherAssignmentStatusType,
} from "../../../../../shared/constants/teacher-assignment.constants.js";
import { PaginationMetadata } from "../../../../../shared/types/pagination.types.js";

export interface TeacherAssignmentListItem {
  readonly id: string;
  readonly teacherId: string;
  readonly teacherName: string;
  readonly employeeCode: string;
  readonly email: string | null;
  readonly role: TeacherAssignmentRoleType;
  readonly status: TeacherAssignmentStatusType;
  readonly academicYearId: string;
  readonly academicYearName: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly sectionId: string;
  readonly sectionName: string;
  readonly subjectId: string | null;
  readonly subjectName: string | null;
  readonly subjectCode: string | null;
  readonly teacherActiveLoad: number;
  readonly startDate: Date;
  readonly endDate: Date | null;
}

export interface SingleTeacherAssignmentInput {
  readonly teacherId: string;
  readonly academicYearId: string;
  readonly sectionId: string;
  readonly subjectId?: string | null;
  readonly role: TeacherAssignmentRoleType;
}

export interface CreateTeacherAssignmentInput {
  readonly teacherId: string;
  readonly academicYearId: string;
  readonly sectionId?: string;
  readonly sectionIds?: readonly string[];
  readonly subjectId?: string | null;
  readonly role: TeacherAssignmentRoleType;
}

export interface ReassignTeacherAssignmentInput {
  readonly replacementTeacherId: string;
  readonly reason: string;
}

export interface EndTeacherAssignmentInput {
  readonly reason: string;
}

export interface TeacherLoadSummary {
  readonly teacherId: string;
  readonly teacherName: string;
  readonly employeeCode: string;
  readonly activeAssignmentsCount: number;
  readonly homeroomCount: number;
  readonly subjectAssignmentsCount: number;
  readonly assignments: readonly TeacherAssignmentListItem[];
}

export interface PaginatedTeacherAssignmentsResult {
  readonly items: readonly TeacherAssignmentListItem[];
  readonly pagination: PaginationMetadata;
}

export interface TeacherAssignmentFilterParams {
  readonly tenantId: string;
  readonly academicYearId: string;
  readonly gradeId?: string;
  readonly sectionId?: string;
  readonly subjectId?: string;
  readonly teacherId?: string;
  readonly role?: TeacherAssignmentRoleType;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
}
