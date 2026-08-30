export interface TeacherExperience {
  readonly id: string;
  readonly tenantId: string;
  readonly teacherId: string;
  readonly institution: string;
  readonly position: string | null;
  readonly subjectId: string | null;
  readonly startDate: string;
  readonly endDate: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateExperiencePayload {
  readonly institution: string;
  readonly position?: string | null;
  readonly subjectId?: string | null;
  readonly startDate: string;
  readonly endDate?: string | null;
}

export interface UpdateExperiencePayload {
  readonly institution?: string;
  readonly position?: string | null;
  readonly subjectId?: string | null;
  readonly startDate?: string;
  readonly endDate?: string | null;
}
