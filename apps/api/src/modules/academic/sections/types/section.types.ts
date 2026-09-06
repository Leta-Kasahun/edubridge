import { SectionStatusType } from "../../../../shared/constants/section.constants.js";

export interface SectionHomeroomTeacher {
  readonly id: string;
  readonly teacherId: string;
  readonly fullName: string;
  readonly employeeCode: string;
}

export interface SectionEnrolledStudent {
  readonly id: string;
  readonly studentId: string;
  readonly studentCode: string;
  readonly fullName: string;
  readonly gender: string;
  readonly status: string;
  readonly enrolledAt: Date;
}

export interface SectionAssignedTeacher {
  readonly id: string;
  readonly teacherId: string;
  readonly fullName: string;
  readonly employeeCode: string;
  readonly role: string;
  readonly subjectId: string | null;
  readonly subjectName: string | null;
  readonly subjectCode: string | null;
}

export interface SectionRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly academicYearId: string;
  readonly academicYearName: string;
  readonly academicYearCode: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly name: string;
  readonly code: string;
  readonly capacity: number | null;
  readonly status: SectionStatusType;
  readonly studentCount: number;
  readonly homeroomTeacher: SectionHomeroomTeacher | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SectionDetailRecord extends SectionRecord {
  readonly enrolledStudents: readonly SectionEnrolledStudent[];
  readonly assignedTeachers: readonly SectionAssignedTeacher[];
}

export interface CreateSectionInput {
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly name: string;
  readonly code?: string;
  readonly capacity?: number | null;
  readonly homeroomTeacherId?: string | null;
}

export interface BulkCreateSectionsInput {
  readonly academicYearId: string;
  readonly gradeId: string;
  readonly sectionNames: readonly string[];
  readonly capacity?: number | null;
}

export interface UpdateSectionInput {
  readonly name?: string;
  readonly capacity?: number | null;
  readonly status?: SectionStatusType;
  readonly homeroomTeacherId?: string | null;
}

export interface SectionFilterParams {
  readonly tenantId?: string;
  readonly academicYearId?: string;
  readonly gradeId?: string;
  readonly status?: SectionStatusType;
  readonly search?: string;
  readonly teacherId?: string;
}

