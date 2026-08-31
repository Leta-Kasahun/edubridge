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

export interface SubjectRecord {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly assignedGradeLevels: readonly number[];
  readonly assignedGradeCount: number;
  readonly teacherAssignmentCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SubjectDetailRecord {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly assignedGrades: readonly AssignedGradeItem[];
  readonly assignedTeachers: readonly SubjectTeacherItem[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateSubjectInput {
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly gradeLevels?: readonly number[];
}

export interface UpdateSubjectInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}

export interface AssignGradeSubjectsInput {
  readonly gradeLevels: readonly number[];
}

export interface SubjectFilterParams {
  readonly tenantId?: string;
  readonly gradeLevel?: number;
  readonly isActive?: boolean;
  readonly search?: string;
}
