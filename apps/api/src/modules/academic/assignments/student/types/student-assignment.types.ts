import { StudentEnrollmentStatusType } from "../../../../../shared/constants/student-assignment.constants.js";
import { PaginationMetadata } from "../../../../../shared/types/pagination.types.js";

export interface StudentRosterItem {
  readonly enrollmentId: string;
  readonly studentId: string;
  readonly studentCode: string;
  readonly fullName: string;
  readonly username: string | null;
  readonly gender: "MALE" | "FEMALE";
  readonly academicYearId: string;
  readonly academicYearName: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly sectionId: string;
  readonly sectionName: string;
  readonly status: StudentEnrollmentStatusType;
  readonly enrolledAt: Date;
}

export interface StudentEnrollmentHistoryItem {
  readonly id: string;
  readonly academicYearId: string;
  readonly academicYearName: string;
  readonly academicYearCode: string;
  readonly gradeLevel: number;
  readonly sectionName: string;
  readonly sectionCode: string;
  readonly status: StudentEnrollmentStatusType;
  readonly enrolledAt: Date;
  readonly endedAt: Date | null;
}

export interface SectionCapacityInfo {
  readonly sectionId: string;
  readonly sectionName: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly capacity: number | null;
  readonly activeCount: number;
  readonly availableSeats: number | null;
}

export interface SingleTransferInput {
  readonly targetSectionId: string;
  readonly reason: string;
}

export interface BulkTransferInput {
  readonly studentIds: readonly string[];
  readonly targetSectionId: string;
  readonly reason: string;
}

export interface PromotionPreviewQuery {
  readonly sourceAcademicYearId: string;
  readonly targetAcademicYearId: string;
  readonly gradeLevel: number;
}

export interface PromotionPreviewRow {
  readonly studentId: string;
  readonly studentCode: string;
  readonly fullName: string;
  readonly gender: "MALE" | "FEMALE";
  readonly currentGradeLevel: number;
  readonly currentSectionId: string;
  readonly currentSectionName: string;
  readonly proposedGradeId: string | null;
  readonly proposedGradeLevel: number;
  readonly proposedSectionId: string | null;
  readonly proposedSectionName: string | null;
  readonly isPromoted: boolean;
}

export interface PromotionPreviewResult {
  readonly sourceAcademicYearId: string;
  readonly targetAcademicYearId: string;
  readonly gradeLevel: number;
  readonly targetGradeLevel: number;
  readonly students: readonly PromotionPreviewRow[];
  readonly targetSections: readonly SectionCapacityInfo[];
}

export interface CommitPromotionItem {
  readonly studentId: string;
  readonly targetGradeId: string;
  readonly targetSectionId: string;
  readonly isPromoted: boolean;
}

export interface CommitPromotionInput {
  readonly sourceAcademicYearId: string;
  readonly targetAcademicYearId: string;
  readonly items: readonly CommitPromotionItem[];
}

export interface WithdrawStudentInput {
  readonly reason: string;
}

export interface PaginatedRosterResult {
  readonly items: readonly StudentRosterItem[];
  readonly pagination: PaginationMetadata;
}

export interface RosterFilterParams {
  readonly tenantId: string;
  readonly academicYearId: string;
  readonly gradeId?: string;
  readonly sectionId?: string;
  readonly search?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly teacherId?: string;
}

