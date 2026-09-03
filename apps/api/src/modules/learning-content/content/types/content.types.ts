import {
  ContentTypeEnum,
  ContentStatusEnum,
  ContentSourceTypeEnum,
} from "../../../../shared/constants/index.js";

export interface ContentVersionBody {
  readonly text?: string;
  readonly summary?: string;
  readonly instructions?: string;
  readonly resources?: readonly string[];
  readonly attachmentIds?: readonly string[];
  readonly [key: string]: unknown;
}

export interface CreateLearningContentDto {
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentTypeEnum;
  readonly source?: ContentSourceTypeEnum;
  readonly primaryTopicId: string;
  readonly secondaryTopicIds?: readonly string[];
  readonly objectiveIds?: readonly string[];
  readonly initialVersionBody?: ContentVersionBody;
  readonly changeNote?: string;
}

export interface UpdateLearningContentDto {
  readonly title?: string;
  readonly description?: string | null;
  readonly type?: ContentTypeEnum;
  readonly source?: ContentSourceTypeEnum;
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

export interface ContentFilterQuery {
  readonly search?: string;
  readonly type?: ContentTypeEnum;
  readonly status?: ContentStatusEnum;
  readonly source?: ContentSourceTypeEnum;
  readonly topicId?: string;
  readonly objectiveId?: string;
  readonly authorId?: string;
  readonly curriculumVersionId?: string;
  readonly subjectId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface ContentAttachmentResponse {
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

export interface ContentVersionResponse {
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
  readonly snapshottedAttachments?: readonly ContentAttachmentResponse[];
}

export interface ContentTopicMappingResponse {
  readonly topicId: string;
  readonly isPrimary: boolean;
  readonly topicCode: string;
  readonly topicTitle: string;
  readonly unitCode?: string;
  readonly unitTitle?: string;
  readonly subjectId?: string;
  readonly subjectName?: string;
}

export interface ContentObjectiveMappingResponse {
  readonly objectiveId: string;
  readonly objectiveCode: string;
  readonly objectiveStatement: string;
  readonly objectiveDescription?: string | null;
}

export interface ContentListItemResponse {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentTypeEnum;
  readonly source: ContentSourceTypeEnum;
  readonly status: ContentStatusEnum;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
  readonly primaryTopic?: ContentTopicMappingResponse | null;
  readonly mappedObjectiveCount: number;
  readonly attachmentCount: number;
  readonly publishedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContentDetailResponse {
  readonly id: string;
  readonly title: string;
  readonly description?: string | null;
  readonly type: ContentTypeEnum;
  readonly source: ContentSourceTypeEnum;
  readonly status: ContentStatusEnum;
  readonly currentVersion: number;
  readonly authorId: string;
  readonly authorName?: string;
  readonly publishedAt?: string | null;
  readonly archivedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly topics: readonly ContentTopicMappingResponse[];
  readonly objectives: readonly ContentObjectiveMappingResponse[];
  readonly currentVersionDetail?: ContentVersionResponse | null;
  readonly attachments: readonly ContentAttachmentResponse[];
}

export interface PaginatedContentResult {
  readonly data: readonly ContentListItemResponse[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
  };
}
