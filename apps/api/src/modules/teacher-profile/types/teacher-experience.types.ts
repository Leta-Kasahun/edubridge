export interface TeacherExperienceRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly teacherId: string;
  readonly institution: string;
  readonly position: string | null;
  readonly subjectId: string | null;
  readonly startDate: Date;
  readonly endDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateTeacherExperienceInput {
  readonly institution: string;
  readonly position?: string | null;
  readonly subjectId?: string | null;
  readonly startDate: string | Date;
  readonly endDate?: string | Date | null;
}

export interface UpdateTeacherExperienceInput {
  readonly institution?: string;
  readonly position?: string | null;
  readonly subjectId?: string | null;
  readonly startDate?: string | Date;
  readonly endDate?: string | Date | null;
}
