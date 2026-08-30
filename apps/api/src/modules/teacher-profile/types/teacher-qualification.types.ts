import { QualificationLevel } from "../../../generated/prisma/client.js";

export { QualificationLevel };

export interface TeacherQualificationRecord {
  id: string;
  tenantId: string;
  teacherId: string;
  level: QualificationLevel;
  fieldOfStudy: string;
  institution: string | null;
  startYear: number | null;
  graduationYear: number | null;
  documentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeacherQualificationInput {
  level: QualificationLevel;
  fieldOfStudy: string;
  institution?: string | null;
  startYear?: number | null;
  graduationYear?: number | null;
  documentUrl?: string | null;
}

export interface UpdateTeacherQualificationInput {
  level?: QualificationLevel;
  fieldOfStudy?: string;
  institution?: string | null;
  startYear?: number | null;
  graduationYear?: number | null;
  documentUrl?: string | null;
}
