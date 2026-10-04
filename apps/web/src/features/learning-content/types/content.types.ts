export type ContentType =
  | "TEXT"
  | "LESSON"
  | "NOTE"
  | "VIDEO"
  | "PDF"
  | "IMAGE"
  | "LINK"
  | "TEXTBOOK"
  | "REFERENCE_BOOK"
  | "WORKSHEET"
  | "EXERCISE"
  | "PAST_EXAM_PAPER"
  | "TEACHER_GUIDE"
  | "STUDY_GUIDE";

export type ContentScope = "SUBJECT" | "GRADE_SUBJECT" | "UNIT" | "TOPIC";

export type ContentStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ContentSourceType = "SYSTEM" | "TEACHER" | "AI";

export interface ContentVersionBody {
  readonly text?: string;
  readonly resourceUrl?: string | null;
  readonly attachmentIds?: readonly string[];
  readonly [key: string]: unknown;
}

export interface ContentAttachmentItem {
  readonly id: string;
  readonly contentId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly storageKey: string;
  readonly sizeBytes: string;
  readonly deliveryUrl: string;
  readonly metadata?: Record<string, unknown> | null;
  readonly uploadedById: string;
  readonly uploaderName?: string;
  readonly createdAt: string;
}

export interface ContentVersionItem {
  readonly id: string;
  readonly contentId: string;
  readonly version: number;
  readonly body: ContentVersionBody;
  readonly changeNote?: string | null;
  readonly createdById: string;
  readonly creatorName?: string;
  readonly reviewedById?: string | null;
  readonly reviewerName?: string | null;
  readonly reviewedAt?: string | null;
  readonly publishedAt?: string | null;
  readonly createdAt: string;
  readonly snapshottedAttachments?: readonly ContentAttachmentItem[];
}

export interface ContentTopicMapping {
  readonly topicId: string;
  readonly isPrimary: boolean;
  readonly topicCode: string;
  readonly topicTitle: string;
  readonly unitCode?: string;
  readonly unitTitle?: string;
  readonly subjectId?: string;
  readonly subjectName?: string;
}

export interface ContentObjectiveMapping {
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly objectiveStatement: string;
  readonly objectiveDescription?: string | null;
}

export interface LearningContentListItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentType;
  readonly scope: ContentScope;
  readonly source: ContentSourceType;
  readonly status: ContentStatus;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
  readonly subjectId?: string | null;
  readonly subjectName?: string | null;
  readonly gradeId?: string | null;
  readonly gradeLevel?: number | null;
  readonly unitId?: string | null;
  readonly unitTitle?: string | null;
  readonly curriculumVersionId?: string | null;
  readonly targetGradeLevels: readonly number[];
  readonly primaryTopic?: ContentTopicMapping | null;
  readonly mappedObjectiveCount: number;
  readonly attachmentCount: number;
  readonly publishedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LearningContentDetailItem {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentType;
  readonly scope: ContentScope;
  readonly source: ContentSourceType;
  readonly status: ContentStatus;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
  readonly subjectId?: string | null;
  readonly subjectName?: string | null;
  readonly gradeId?: string | null;
  readonly gradeLevel?: number | null;
  readonly unitId?: string | null;
  readonly unitTitle?: string | null;
  readonly curriculumVersionId?: string | null;
  readonly targetGradeLevels: readonly number[];
  readonly publishedAt?: string | null;
  readonly archivedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly topics: readonly ContentTopicMapping[];
  readonly objectives: readonly ContentObjectiveMapping[];
  readonly currentVersionDetail?: ContentVersionItem | null;
  readonly attachments: readonly ContentAttachmentItem[];
}

export interface ContentFilters {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly type?: ContentType;
  readonly scope?: ContentScope;
  readonly status?: ContentStatus;
  readonly source?: ContentSourceType;
  readonly subjectId?: string;
  readonly gradeId?: string;
  readonly targetGradeLevel?: number;
  readonly unitId?: string;
  readonly topicId?: string;
  readonly objectiveId?: string;
  readonly curriculumVersionId?: string;
  readonly academicYearId?: string;
}

export interface CreateLearningContentDto {
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentType;
  readonly scope?: ContentScope;
  readonly source?: ContentSourceType;
  readonly subjectId?: string;
  readonly gradeId?: string;
  readonly unitId?: string;
  readonly curriculumVersionId?: string;
  readonly targetGradeLevels?: readonly number[];
  readonly primaryTopicId?: string;
  readonly secondaryTopicIds?: readonly string[];
  readonly objectiveIds?: readonly string[];
  readonly initialVersionBody?: ContentVersionBody;
  readonly changeNote?: string;
}

export interface UpdateLearningContentDto {
  readonly title?: string;
  readonly description?: string | null;
  readonly type?: ContentType;
  readonly scope?: ContentScope;
  readonly source?: ContentSourceType;
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly unitId?: string | null;
  readonly curriculumVersionId?: string | null;
  readonly targetGradeLevels?: readonly number[];
}

export interface UpdateContentMappingsDto {
  readonly scope?: ContentScope;
  readonly subjectId?: string | null;
  readonly gradeId?: string | null;
  readonly unitId?: string | null;
  readonly curriculumVersionId?: string | null;
  readonly targetGradeLevels?: readonly number[];
  readonly primaryTopicId?: string | null;
  readonly secondaryTopicIds?: readonly string[];
  readonly objectiveIds?: readonly string[];
}

export interface CreateContentVersionDto {
  readonly body: ContentVersionBody;
  readonly changeNote?: string;
}

export interface PaginatedContentResponse {
  readonly success: boolean;
  readonly data: readonly LearningContentListItem[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}

export interface SaveContentProgressDto {
  readonly lastPositionSeconds: number;
  readonly durationSeconds: number;
  readonly progressPercent: number;
  readonly isCompleted?: boolean;
}

export interface StudentContentProgressItem {
  readonly id: string;
  readonly tenantId: string;
  readonly studentId?: string;
  readonly contentId: string;
  readonly lastPositionSeconds: number;
  readonly durationSeconds: number;
  readonly progressPercent: number;
  readonly isCompleted: boolean;
  readonly lastAccessedAt: string;
}

export interface StudentInProgressContentItem {
  readonly id: string;
  readonly contentId: string;
  readonly title: string;
  readonly type: ContentType;
  readonly scope: ContentScope;
  readonly subjectCode: string;
  readonly subjectName: string;
  readonly unitTitle?: string | null;
  readonly lastPositionSeconds: number;
  readonly durationSeconds: number;
  readonly progressPercent: number;
  readonly lastAccessedAt: string;
}
