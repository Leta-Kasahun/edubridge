import { QualificationLevel, TeacherStatus, AccountStatus } from "../../../generated/prisma/client.js";

export interface DirectoryQualification {
  readonly id: string;
  readonly level: QualificationLevel;
  readonly fieldOfStudy: string;
  readonly institution: string | null;
  readonly startYear: number | null;
  readonly graduationYear: number | null;
  readonly documentUrl: string | null;
}

export interface DirectoryExperience {
  readonly id: string;
  readonly institution: string;
  readonly position: string | null;
  readonly startDate: Date;
  readonly endDate: Date | null;
}

export interface TeacherDirectoryItem {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string | null;
  readonly employeeCode: string;
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly photoUrl: string | null;
  readonly status: TeacherStatus;
  readonly accountStatus: AccountStatus | null;
  readonly fieldsOfStudy: readonly string[];
  readonly qualifications: readonly DirectoryQualification[];
  readonly experiences: readonly DirectoryExperience[];
  readonly certificateCount: number;
  readonly highestLevel: QualificationLevel | null;
  readonly latestPosition: string | null;
  readonly totalExperienceMonths: number;
}

export interface TeacherDirectoryFilterParams {
  readonly tenantId?: string;
  readonly search?: string;
  readonly level?: QualificationLevel;
  readonly hasCertificate?: boolean;
  readonly status?: TeacherStatus;
  readonly page?: number;
  readonly limit?: number;
}

export interface TeacherDirectoryResult {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly data: readonly TeacherDirectoryItem[];
}
