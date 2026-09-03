import {
  ContentRepository,
  contentRepository,
} from "../repository/content.repository.js";
import {
  ContentAttachmentService,
  contentAttachmentService,
} from "./content-attachment.service.js";
import {
  CreateLearningContentDto,
  UpdateLearningContentDto,
  UpdateContentMappingsDto,
  CreateContentVersionDto,
  ContentFilterQuery,
  ContentDetailResponse,
  ContentListItemResponse,
  PaginatedContentResult,
  ContentVersionResponse,
  ContentTopicMappingResponse,
  ContentObjectiveMappingResponse,
  ContentVersionBody,
} from "../types/content.types.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import {
  ContentTypeEnum,
  ContentSourceTypeEnum,
  ContentStatusEnum,
} from "../../../../shared/constants/index.js";

export class ContentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository,
    private readonly attachmentService: ContentAttachmentService = contentAttachmentService
  ) {}

  async listContent(
    tenantId: string,
    filters: ContentFilterQuery
  ): Promise<PaginatedContentResult> {
    const { items, total } = await this.repository.findManyWithFilters(
      tenantId,
      filters
    );

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const totalPages = Math.ceil(total / limit) || 1;

    const data: readonly ContentListItemResponse[] = items.map((item) => {
      const primaryTopicRecord =
        item.topics.find((t) => t.isPrimary) || item.topics[0] || null;

      let primaryTopic: ContentTopicMappingResponse | null = null;
      if (primaryTopicRecord) {
        primaryTopic = {
          topicId: primaryTopicRecord.topicId,
          isPrimary: primaryTopicRecord.isPrimary,
          topicCode: primaryTopicRecord.topic.code,
          topicTitle: primaryTopicRecord.topic.title,
          unitCode: primaryTopicRecord.topic.unit?.code,
          unitTitle: primaryTopicRecord.topic.unit?.title,
          subjectId:
            primaryTopicRecord.topic.unit?.curriculumSubject?.subject?.id,
          subjectName:
            primaryTopicRecord.topic.unit?.curriculumSubject?.subject?.name,
        };
      }

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type as ContentTypeEnum,
        source: item.source as ContentSourceTypeEnum,
        status: item.status as ContentStatusEnum,
        currentVersion: item.currentVersion,
        authorId: item.authorId,
        authorName: item.author
          ? `${item.author.firstName} ${item.author.lastName}`.trim()
          : undefined,
        primaryTopic,
        mappedObjectiveCount: item._count.objectives,
        attachmentCount: item._count.attachments,
        publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      };
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getContentDetail(
    tenantId: string,
    id: string
  ): Promise<ContentDetailResponse> {
    const item = await this.repository.findById(tenantId, id);
    if (!item) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    const topics: readonly ContentTopicMappingResponse[] = item.topics.map(
      (t) => ({
        topicId: t.topicId,
        isPrimary: t.isPrimary,
        topicCode: t.topic.code,
        topicTitle: t.topic.title,
        unitCode: t.topic.unit?.code,
        unitTitle: t.topic.unit?.title,
        subjectId: t.topic.unit?.curriculumSubject?.subject?.id,
        subjectName: t.topic.unit?.curriculumSubject?.subject?.name,
      })
    );

    const objectives: readonly ContentObjectiveMappingResponse[] =
      item.objectives.map((o) => ({
        objectiveId: o.objectiveId,
        objectiveCode: o.objective.code,
        objectiveStatement: o.objective.statement,
        objectiveDescription: o.objective.description,
      }));

    const attachments = item.attachments.map((att) =>
      this.attachmentService.formatAttachmentResponse(att)
    );

    const currentVersionRecord =
      item.versions.find((v) => v.version === item.currentVersion) ||
      item.versions[0] ||
      null;

    let currentVersionDetail: ContentVersionResponse | null = null;
    if (currentVersionRecord) {
      const bodyObj = (currentVersionRecord.body &&
      typeof currentVersionRecord.body === "object"
        ? (currentVersionRecord.body as ContentVersionBody)
        : {}) as ContentVersionBody;

      const snapshottedAttachmentIds = bodyObj.attachmentIds ?? [];
      const snapshottedAttachments = attachments.filter((a) =>
        snapshottedAttachmentIds.includes(a.id)
      );

      currentVersionDetail = {
        id: currentVersionRecord.id,
        contentId: currentVersionRecord.contentId,
        version: currentVersionRecord.version,
        body: bodyObj,
        changeNote: currentVersionRecord.changeNote,
        createdById: currentVersionRecord.createdById,
        creatorName: currentVersionRecord.createdBy
          ? `${currentVersionRecord.createdBy.firstName} ${currentVersionRecord.createdBy.lastName}`.trim()
          : undefined,
        reviewedById: currentVersionRecord.reviewedById,
        reviewerName: currentVersionRecord.reviewedBy
          ? `${currentVersionRecord.reviewedBy.firstName} ${currentVersionRecord.reviewedBy.lastName}`.trim()
          : undefined,
        reviewedAt: currentVersionRecord.reviewedAt
          ? currentVersionRecord.reviewedAt.toISOString()
          : null,
        publishedAt: currentVersionRecord.publishedAt
          ? currentVersionRecord.publishedAt.toISOString()
          : null,
        createdAt: currentVersionRecord.createdAt.toISOString(),
        snapshottedAttachments,
      };
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type as ContentTypeEnum,
      source: item.source as ContentSourceTypeEnum,
      status: item.status as ContentStatusEnum,
      currentVersion: item.currentVersion,
      authorId: item.authorId,
      authorName: item.author
        ? `${item.author.firstName} ${item.author.lastName}`.trim()
        : undefined,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      archivedAt: item.archivedAt ? item.archivedAt.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      topics,
      objectives,
      currentVersionDetail,
      attachments,
    };
  }

  async createContent(
    tenantId: string,
    authorId: string,
    data: CreateLearningContentDto
  ): Promise<ContentDetailResponse> {
    const validation = await this.repository.validateTopicAndObjectivesExist(
      tenantId,
      data.primaryTopicId,
      data.secondaryTopicIds ?? [],
      data.objectiveIds ?? []
    );

    if (!validation.isValid) {
      const errors: string[] = [];
      if (validation.missingTopicIds.length > 0) {
        errors.push(
          `Invalid or unmapped topic IDs: ${validation.missingTopicIds.join(", ")}`
        );
      }
      if (validation.missingObjectiveIds.length > 0) {
        errors.push(
          `Invalid or unmapped objective IDs: ${validation.missingObjectiveIds.join(", ")}`
        );
      }
      throw new BadRequestError(errors.join("; "));
    }

    const created = await this.repository.createContentWithVersionAndMappings(
      tenantId,
      authorId,
      data
    );

    if (!created) {
      throw new BadRequestError("Failed to create learning content record");
    }

    return this.getContentDetail(tenantId, created.id);
  }

  async updateContentMetadata(
    tenantId: string,
    id: string,
    data: UpdateLearningContentDto
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    await this.repository.updateMetadata(tenantId, id, data);
    return this.getContentDetail(tenantId, id);
  }

  async updateContentMappings(
    tenantId: string,
    id: string,
    data: UpdateContentMappingsDto
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    const validation = await this.repository.validateTopicAndObjectivesExist(
      tenantId,
      data.primaryTopicId,
      data.secondaryTopicIds ?? [],
      data.objectiveIds ?? []
    );

    if (!validation.isValid) {
      const errors: string[] = [];
      if (validation.missingTopicIds.length > 0) {
        errors.push(
          `Invalid or unmapped topic IDs: ${validation.missingTopicIds.join(", ")}`
        );
      }
      if (validation.missingObjectiveIds.length > 0) {
        errors.push(
          `Invalid or unmapped objective IDs: ${validation.missingObjectiveIds.join(", ")}`
        );
      }
      throw new BadRequestError(errors.join("; "));
    }

    await this.repository.updateMappings(tenantId, id, data);
    return this.getContentDetail(tenantId, id);
  }

  async saveNewVersion(
    tenantId: string,
    contentId: string,
    createdById: string,
    data: CreateContentVersionDto
  ): Promise<ContentVersionResponse> {
    const existing = await this.repository.findById(tenantId, contentId);
    if (!existing) {
      throw new NotFoundError(`Learning content ${contentId} not found`);
    }

    const newVersion = await this.repository.createNextVersion(
      tenantId,
      contentId,
      createdById,
      data
    );

    const bodyObj = (newVersion.body && typeof newVersion.body === "object"
      ? (newVersion.body as ContentVersionBody)
      : {}) as ContentVersionBody;

    const attachmentIds = bodyObj.attachmentIds ?? [];
    const attachments = await this.repository.findAttachmentsByIds(
      tenantId,
      attachmentIds
    );

    const snapshottedAttachments = attachments.map((a) =>
      this.attachmentService.formatAttachmentResponse(a)
    );

    return {
      id: newVersion.id,
      contentId: newVersion.contentId,
      version: newVersion.version,
      body: bodyObj,
      changeNote: newVersion.changeNote,
      createdById: newVersion.createdById,
      creatorName: newVersion.createdBy
        ? `${newVersion.createdBy.firstName} ${newVersion.createdBy.lastName}`.trim()
        : undefined,
      reviewedById: newVersion.reviewedById,
      reviewerName: null,
      reviewedAt: null,
      publishedAt: null,
      createdAt: newVersion.createdAt.toISOString(),
      snapshottedAttachments,
    };
  }

  async getVersions(
    tenantId: string,
    contentId: string
  ): Promise<readonly ContentVersionResponse[]> {
    const existing = await this.repository.findById(tenantId, contentId);
    if (!existing) {
      throw new NotFoundError(`Learning content ${contentId} not found`);
    }

    const versions = await this.repository.findVersionsByContentId(
      tenantId,
      contentId
    );

    const allAttachments = await this.repository.findAttachmentsByContentId(
      tenantId,
      contentId
    );
    const attachmentMap = new Map(
      allAttachments.map((a) => [
        a.id,
        this.attachmentService.formatAttachmentResponse(a),
      ])
    );

    return versions.map((v) => {
      const bodyObj = (v.body && typeof v.body === "object"
        ? (v.body as ContentVersionBody)
        : {}) as ContentVersionBody;

      const snapshottedAttachmentIds = bodyObj.attachmentIds ?? [];
      const snapshottedAttachments = snapshottedAttachmentIds
        .map((id) => attachmentMap.get(id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a));

      return {
        id: v.id,
        contentId: v.contentId,
        version: v.version,
        body: bodyObj,
        changeNote: v.changeNote,
        createdById: v.createdById,
        creatorName: v.createdBy
          ? `${v.createdBy.firstName} ${v.createdBy.lastName}`.trim()
          : undefined,
        reviewedById: v.reviewedById,
        reviewerName: v.reviewedBy
          ? `${v.reviewedBy.firstName} ${v.reviewedBy.lastName}`.trim()
          : undefined,
        reviewedAt: v.reviewedAt ? v.reviewedAt.toISOString() : null,
        publishedAt: v.publishedAt ? v.publishedAt.toISOString() : null,
        createdAt: v.createdAt.toISOString(),
        snapshottedAttachments,
      };
    });
  }

  async getVersionByNumber(
    tenantId: string,
    contentId: string,
    versionNumber: number
  ): Promise<ContentVersionResponse> {
    const versionRecord = await this.repository.findVersionByNumber(
      tenantId,
      contentId,
      versionNumber
    );

    if (!versionRecord) {
      throw new NotFoundError(
        `Version ${versionNumber} not found for content ${contentId}`
      );
    }

    const bodyObj = (versionRecord.body && typeof versionRecord.body === "object"
      ? (versionRecord.body as ContentVersionBody)
      : {}) as ContentVersionBody;

    const attachmentIds = bodyObj.attachmentIds ?? [];
    const attachments = await this.repository.findAttachmentsByIds(
      tenantId,
      attachmentIds
    );

    const snapshottedAttachments = attachments.map((a) =>
      this.attachmentService.formatAttachmentResponse(a)
    );

    return {
      id: versionRecord.id,
      contentId: versionRecord.contentId,
      version: versionRecord.version,
      body: bodyObj,
      changeNote: versionRecord.changeNote,
      createdById: versionRecord.createdById,
      creatorName: versionRecord.createdBy
        ? `${versionRecord.createdBy.firstName} ${versionRecord.createdBy.lastName}`.trim()
        : undefined,
      reviewedById: versionRecord.reviewedById,
      reviewerName: versionRecord.reviewedBy
        ? `${versionRecord.reviewedBy.firstName} ${versionRecord.reviewedBy.lastName}`.trim()
        : undefined,
      reviewedAt: versionRecord.reviewedAt
        ? versionRecord.reviewedAt.toISOString()
        : null,
      publishedAt: versionRecord.publishedAt
        ? versionRecord.publishedAt.toISOString()
        : null,
      createdAt: versionRecord.createdAt.toISOString(),
      snapshottedAttachments,
    };
  }

  async submitContentForReview(
    tenantId: string,
    id: string
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestError(
        `Content in ${existing.status} status cannot be submitted for review`
      );
    }

    await this.repository.updateStatus(tenantId, id, "PENDING_REVIEW");
    return this.getContentDetail(tenantId, id);
  }

  async publishContent(
    tenantId: string,
    id: string,
    reviewerId: string
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    await this.repository.updateStatus(tenantId, id, "PUBLISHED", reviewerId);
    return this.getContentDetail(tenantId, id);
  }

  async archiveContent(
    tenantId: string,
    id: string
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    await this.repository.updateStatus(tenantId, id, "ARCHIVED");
    return this.getContentDetail(tenantId, id);
  }

  async deleteContent(
    tenantId: string,
    id: string
  ): Promise<{ readonly deleted: boolean; readonly message: string }> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (existing.status === "DRAFT") {
      const deleted = await this.repository.deleteDraftContent(tenantId, id);
      return {
        deleted,
        message: "Draft content deleted successfully",
      };
    }

    await this.repository.updateStatus(tenantId, id, "ARCHIVED");
    return {
      deleted: true,
      message: "Published content archived successfully",
    };
  }
}

export const contentService = new ContentService();
