export interface AssignedGradeItem {
  readonly id: string;
  readonly gradeId: string;
  readonly level: number;
}

export interface SubjectTeacherItem {
  readonly id: string;
  readonly teacherId: string;
  readonly fullName: string;
  readonly employeeCode: string;
  readonly sectionName: string;
  readonly gradeLevel: number;
}

export interface SubjectItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly assignedGradeLevels: readonly number[];
  readonly assignedGradeCount: number;
  readonly teacherAssignmentCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SubjectDetailItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly assignedGrades: readonly AssignedGradeItem[];
  readonly assignedTeachers: readonly SubjectTeacherItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateSubjectPayload {
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly gradeLevels?: readonly number[];
}

export interface UpdateSubjectPayload {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}

export interface AssignGradesPayload {
  readonly gradeLevels: readonly number[];
}

export interface SubjectFilters {
  readonly gradeLevel?: number;
  readonly isActive?: boolean;
  readonly search?: string;
}
