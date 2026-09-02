export interface LearningObjectiveRecord {
  readonly id: string;
  readonly topicId: string;
  readonly code: string;
  readonly statement: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumTopicRecord {
  readonly id: string;
  readonly unitId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly objectiveCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumUnitRecord {
  readonly id: string;
  readonly curriculumSubjectId: string;
  readonly code: string;
  readonly title: string;
  readonly description: string | null;
  readonly orderIndex: number;
  readonly externalId: string | null;
  readonly topicCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumSubjectRecord {
  readonly id: string;
  readonly curriculumVersionId: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
  readonly subjectId: string;
  readonly subjectName: string;
  readonly subjectCode: string;
  readonly externalId: string | null;
  readonly unitCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CurriculumTreeTopic extends CurriculumTopicRecord {
  readonly objectives: readonly LearningObjectiveRecord[];
}

export interface CurriculumTreeUnit extends CurriculumUnitRecord {
  readonly topics: readonly CurriculumTreeTopic[];
}

export interface CurriculumTreeSubject extends CurriculumSubjectRecord {
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

export interface CreateCurriculumSubjectInput {
  readonly curriculumVersionId: string;
  readonly gradeId: string;
  readonly subjectId: string;
  readonly externalId?: string | null;
}

export interface CreateUnitInput {
  readonly curriculumSubjectId: string;
  readonly code: string;
  readonly title: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateUnitInput {
  readonly title?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface CreateTopicInput {
  readonly unitId: string;
  readonly code: string;
  readonly title: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateTopicInput {
  readonly title?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface CreateObjectiveInput {
  readonly topicId: string;
  readonly code: string;
  readonly statement: string;
  readonly description?: string | null;
  readonly orderIndex?: number;
  readonly externalId?: string | null;
}

export interface UpdateObjectiveInput {
  readonly statement?: string;
  readonly description?: string | null;
  readonly externalId?: string | null;
}

export interface ReorderStructureItemsInput {
  readonly entityType: "unit" | "topic" | "objective";
  readonly parentId: string;
  readonly orderedIds: readonly string[];
}
