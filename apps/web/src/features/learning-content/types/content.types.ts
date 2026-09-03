export type ContentType =
  | "TEXT"
  | "LESSON"
  | "NOTE"
  | "VIDEO"
  | "PDF"
  | "IMAGE"
  | "LINK";

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
  readonly source: ContentSourceType;
  readonly status: ContentStatus;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
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
  readonly source: ContentSourceType;
  readonly status: ContentStatus;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
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
  readonly status?: ContentStatus;
  readonly source?: ContentSourceType;
  readonly topicId?: string;
  readonly objectiveId?: string;
  readonly subjectId?: string;
  readonly curriculumVersionId?: string;
}

export interface CreateLearningContentDto {
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentType;
  readonly source?: ContentSourceType;
  readonly primaryTopicId: string;
  readonly secondaryTopicIds?: readonly string[];
  readonly objectiveIds?: readonly string[];
  readonly initialVersionBody?: ContentVersionBody;
  readonly changeNote?: string;
}

export interface UpdateLearningContentDto {
  readonly title?: string;
  readonly description?: string | null;
  readonly type?: ContentType;
  readonly source?: ContentSourceType;
}

export interface UpdateContentMappingsDto {
  readonly primaryTopicId: string;
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
