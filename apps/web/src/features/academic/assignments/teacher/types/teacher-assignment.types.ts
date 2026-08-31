import {
  TeacherAssignmentRoleType,
  TeacherAssignmentStatusType,
} from "@/shared/constants/teacher-assignment.constants";
import { PaginationMeta } from "@/shared/types";

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
  readonly startDate: string;
  readonly endDate: string | null;
}

export interface CreateTeacherAssignmentInput {
  readonly teacherId: string;
  readonly academicYearId: string;
  readonly sectionId: string;
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

export interface PaginatedTeacherAssignmentsResponse {
  readonly items: readonly TeacherAssignmentListItem[];
  readonly pagination: PaginationMeta;
}

export interface TeacherAssignmentFilters {
  readonly academicYearId?: string;
  readonly gradeId?: string;
  readonly sectionId?: string;
  readonly subjectId?: string;
  readonly teacherId?: string;
  readonly role?: TeacherAssignmentRoleType;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
}
