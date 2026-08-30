import {
  QualificationLevel,
  QUALIFICATION_LEVEL_LABELS,
} from "@/features/teacher-profile/types/teacher-qualification.types";

export type { QualificationLevel };
export { QUALIFICATION_LEVEL_LABELS };

export interface StaffQualificationItem {
  readonly id: string;
  readonly level: QualificationLevel;
  readonly fieldOfStudy: string;
  readonly institution: string | null;
  readonly startYear: number | null;
  readonly graduationYear: number | null;
  readonly documentUrl: string | null;
}

export interface StaffExperienceItem {
  readonly id: string;
  readonly institution: string;
  readonly position: string | null;
  readonly startDate: string;
  readonly endDate: string | null;
}

export interface StaffDirectoryItem {
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
  readonly status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  readonly accountStatus: string | null;
  readonly fieldsOfStudy: readonly string[];
  readonly qualifications: readonly StaffQualificationItem[];
  readonly experiences: readonly StaffExperienceItem[];
  readonly certificateCount: number;
  readonly highestLevel: QualificationLevel | null;
  readonly latestPosition: string | null;
  readonly totalExperienceMonths: number;
}

export interface StaffDirectoryFilters {
  readonly search?: string;
  readonly level?: QualificationLevel;
  readonly hasCertificate?: boolean;
  readonly status?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface StaffDirectoryResponse {
  readonly data: readonly StaffDirectoryItem[];
  readonly pagination: {
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
}
