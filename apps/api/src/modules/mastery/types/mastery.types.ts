import { MasteryLevelEnum, EvidenceSourceTypeEnum } from "../../../shared/constants/assessment.constants.js";

export interface StudentMasteryTopicItem {
  readonly topicId: string;
  readonly topicCode: string;
  readonly topicTitle: string;
  readonly unitId: string;
  readonly unitCode: string;
  readonly unitTitle: string;
  readonly level: MasteryLevelEnum;
  readonly accuracy: number | null;
  readonly questionCount: number;
  readonly correctCount: number;
  readonly lastObservedAt: Date | null;
}

export interface StudentSectionMatrixItem {
  readonly studentId: string;
  readonly studentName: string;
  readonly rollNumber: string | null;
  readonly topics: Record<
    string,
    {
      readonly level: MasteryLevelEnum;
      readonly accuracy: number | null;
      readonly questionCount: number;
      readonly correctCount: number;
    }
  >;
  readonly overallAccuracy: number | null;
  readonly masteredTopicCount: number;
}

export interface TopicObjectiveItem {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly description?: string | null;
  readonly orderIndex: number;
}

export interface SectionMasteryMatrixResponse {
  readonly section: {
    readonly id: string;
    readonly name: string;
    readonly gradeLevel: number;
  };
  readonly subject: {
    readonly id: string;
    readonly name: string;
    readonly code: string;
  };
  readonly topics: Array<{
    readonly id: string;
    readonly code: string;
    readonly title: string;
    readonly unitId: string;
    readonly unitCode: string;
    readonly unitTitle: string;
    readonly orderIndex: number;
    readonly objectives?: TopicObjectiveItem[];
  }>;
  readonly students: StudentSectionMatrixItem[];
  readonly summary: {
    readonly totalStudents: number;
    readonly totalTopics: number;
    readonly classAverageAccuracy: number | null;
    readonly masteryDistribution: Record<MasteryLevelEnum, number>;
  };
}

export interface SingleStudentMasteryResponse {
  readonly student: {
    readonly id: string;
    readonly name: string;
    readonly rollNumber: string | null;
    readonly gradeLevel: number;
    readonly sectionName: string | null;
  };
  readonly subjects: Array<{
    readonly subjectId: string;
    readonly subjectName: string;
    readonly subjectCode: string;
    readonly overallAccuracy: number | null;
    readonly totalTopics: number;
    readonly masteredCount: number;
    readonly units: Array<{
      readonly unitId: string;
      readonly unitCode: string;
      readonly unitTitle: string;
      readonly topics: StudentMasteryTopicItem[];
    }>;
  }>;
}

export interface TopicMasteryHistoryItem {
  readonly id: string;
  readonly level: MasteryLevelEnum;
  readonly masteryScore: number | null;
  readonly evidenceCount: number;
  readonly calculatedAt: Date;
  readonly calculationVersion: string | null;
}

export interface RecordEvidenceInput {
  readonly tenantId: string;
  readonly studentId: string;
  readonly attemptId?: string;
  readonly assessmentId?: string;
  readonly questionVersionId?: string;
  readonly topicId: string;
  readonly objectiveId?: string | null;
  readonly sourceType: EvidenceSourceTypeEnum;
  readonly isCorrect: boolean | null;
  readonly awardedPoints: number;
  readonly maxPoints: number;
}

export interface PracticeEvidenceItem {
  readonly questionId: string;
  readonly questionVersionId?: string;
  readonly isCorrect: boolean;
  readonly awardedPoints: number;
  readonly maxPoints: number;
  readonly selectedOptionKey?: string;
}

export interface RecordPracticeEvidenceDto {
  readonly bankId: string;
  readonly results: PracticeEvidenceItem[];
}

export interface MasteryOverviewItem {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly progress: number;
  readonly status: "Mastered" | "Doing Well" | "Needs Practice" | "Learning" | "Not Started";
  readonly totalTopics?: number;
  readonly masteredTopics?: number;
}

export interface MasteryOverviewResponse {
  readonly totalStudents: number;
  readonly overallAccuracy: number | null;
  readonly stats: {
    readonly mastered: number;
    readonly doingWell: number;
    readonly needsPractice: number;
    readonly notStarted: number;
    readonly proficient: number;
    readonly developing: number;
    readonly inProgress: number;
  };
  readonly breakdown: MasteryOverviewItem[];
}
