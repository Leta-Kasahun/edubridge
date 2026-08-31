import { GradeStreamType } from "@/shared/constants";

export interface GradeSectionSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly capacity: number | null;
  readonly studentCount: number;
}

export interface GradeItem {
  readonly id: string;
  readonly tenantId: string;
  readonly level: number;
  readonly category: string;
  readonly availableStreams: readonly GradeStreamType[];
  readonly isActive: boolean;
  readonly sectionCount: number;
  readonly studentCount: number;
  readonly subjectCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface GradeDetailItem extends GradeItem {
  readonly sections: readonly GradeSectionSummary[];
  readonly subjects: readonly {
    readonly id: string;
    readonly name: string;
    readonly code: string;
  }[];
}

export interface CreateGradePayload {
  readonly level: number;
  readonly isActive?: boolean;
}

export interface GradeFilters {
  readonly search?: string;
  readonly isActive?: boolean;
  readonly category?: "ELEMENTARY" | "HIGH_SCHOOL";
  readonly academicYearId?: string;
}
