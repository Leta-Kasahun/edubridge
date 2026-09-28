export type MasteryLevel = "NOT_STARTED" | "DEVELOPING" | "PROFICIENT" | "MASTERED";

export interface StudentMasteryTopicItem {
  readonly topicId: string;
  readonly topicCode: string;
  readonly topicTitle: string;
  readonly unitId: string;
  readonly unitCode: string;
  readonly unitTitle: string;
  readonly level: MasteryLevel;
  readonly accuracy: number | null;
  readonly questionCount: number;
  readonly correctCount: number;
  readonly lastObservedAt: string | null;
}

export interface StudentSectionMatrixItem {
  readonly studentId: string;
  readonly studentName: string;
  readonly rollNumber: string | null;
  readonly topics: Record<
    string,
    {
      readonly level: MasteryLevel;
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
    readonly masteryDistribution: Record<MasteryLevel, number>;
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
  readonly level: MasteryLevel;
  readonly masteryScore: number | null;
  readonly evidenceCount: number;
  readonly calculatedAt: string;
  readonly calculationVersion: string | null;
}

export interface SectionMasteryQueryParams {
  subjectId?: string;
}

export interface RecalculateMasteryPayload {
  studentId?: string;
  topicId?: string;
}
