export interface LearningObjectiveItem {
  readonly id: string;
  readonly topicId: string;
  readonly code: string;
  readonly statement: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumTopicItem {
  readonly id: string;
  readonly unitId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly objectiveCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumUnitItem {
  readonly id: string;
  readonly curriculumSubjectId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly topicCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumSubjectItem {
  readonly id: string;
  readonly curriculumVersionId: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly subjectId: string;
  readonly subjectName: string;
  readonly subjectCode: string;
  readonly externalId: string | null;
  readonly unitCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CurriculumTreeTopic extends CurriculumTopicItem {
  readonly objectives: readonly LearningObjectiveItem[];
}

export interface CurriculumTreeUnit extends CurriculumUnitItem {
  readonly topics: readonly CurriculumTreeTopic[];
}

export interface CurriculumTreeSubject extends CurriculumSubjectItem {
  readonly units: readonly CurriculumTreeUnit[];
}

export interface CurriculumTreeView {
  readonly curriculumId: string;
  readonly curriculumName: string;
  readonly versionId: string;
  readonly versionCode: string;
  readonly versionName: string;
  readonly subjects: readonly CurriculumTreeSubject[];
}

export interface CreateCurriculumSubjectPayload {
  readonly curriculumVersionId: string;
  readonly gradeId: string;
  readonly subjectId: string;
  readonly externalId?: string | null;
}

export interface CreateUnitPayload {
  readonly curriculumSubjectId: string;
  readonly code?: string;
  readonly title: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateUnitPayload {
  readonly title?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface CreateTopicPayload {
  readonly unitId: string;
  readonly code?: string;
  readonly title: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateTopicPayload {
  readonly title?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface CreateObjectivePayload {
  readonly topicId: string;
  readonly code?: string;
  readonly statement: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateObjectivePayload {
  readonly statement?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface ReorderStructurePayload {
  readonly entityType: "unit" | "topic" | "objective";
  readonly parentId: string;
  readonly orderedIds: readonly string[];
}
