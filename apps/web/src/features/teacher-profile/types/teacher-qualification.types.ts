export type QualificationLevel =
  | "CERTIFICATE"
  | "DIPLOMA"
  | "BACHELOR"
  | "MASTER"
  | "DOCTORATE"
  | "OTHER";

export const QUALIFICATION_LEVEL_LABELS: Record<QualificationLevel, string> = {
  CERTIFICATE: "Certificate",
  DIPLOMA: "Diploma",
  BACHELOR: "Bachelor's Degree",
  MASTER: "Master's Degree",
  DOCTORATE: "Doctorate (PhD)",
  OTHER: "Other Qualification",
};

export interface TeacherQualification {
  readonly id: string;
  readonly tenantId: string;
  readonly teacherId: string;
  readonly level: QualificationLevel;
  readonly fieldOfStudy: string;
  readonly institution: string | null;
  readonly startYear: number | null;
  readonly graduationYear: number | null;
  readonly documentUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateQualificationPayload {
  readonly level: QualificationLevel;
  readonly fieldOfStudy: string;
  readonly institution?: string | null;
  readonly startYear?: number | null;
  readonly graduationYear?: number | null;
  readonly documentUrl?: string | null;
}

export interface UpdateQualificationPayload {
  readonly level?: QualificationLevel;
  readonly fieldOfStudy?: string;
  readonly institution?: string | null;
  readonly startYear?: number | null;
  readonly graduationYear?: number | null;
  readonly documentUrl?: string | null;
}
