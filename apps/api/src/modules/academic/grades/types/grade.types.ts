import { GradeStreamType } from "../../../../shared/constants/grade.constants.js";

export interface GradeSectionSummary {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly capacity: number | null;
  readonly studentCount: number;
}

export interface GradeRecord {
  readonly id: string;
  readonly tenantId: string | null;
  readonly level: number;
  readonly category: string;
  readonly availableStreams: readonly GradeStreamType[];
  readonly isActive: boolean;
  readonly sectionCount: number;
  readonly studentCount: number;
  readonly subjectCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface GradeDetailRecord extends GradeRecord {
  readonly sections: readonly GradeSectionSummary[];
  readonly subjects: readonly {
    readonly id: string;
    readonly name: string;
    readonly code: string;
  }[];
}

export interface CreateGradeInput {
  readonly level: number;
  readonly isActive?: boolean;
}

export interface GradeFilterParams {
  readonly tenantId?: string;
  readonly search?: string;
  readonly isActive?: boolean;
  readonly category?: "ELEMENTARY" | "HIGH_SCHOOL";
  readonly academicYearId?: string;
  readonly teacherId?: string;
}

