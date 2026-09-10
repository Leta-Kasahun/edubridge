import {
  ContentRepository,
  contentRepository,
  ResolvedHierarchy,
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
  ForbiddenError,
} from "../../../../shared/exceptions/index.js";
import {
  ContentTypeEnum,
  ContentSourceTypeEnum,
  ContentStatusEnum,
  ContentScopeEnum,
} from "../../../../shared/constants/index.js";

export interface UserAuthContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: readonly string[];
}

export class ContentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository,
    private readonly attachmentService: ContentAttachmentService = contentAttachmentService
  ) {}

  private async resolveAndValidateHierarchy(
    tenantId: string,
    input: {
      readonly scope?: ContentScopeEnum;
      readonly subjectId?: string | null;
      readonly gradeId?: string | null;
      readonly unitId?: string | null;
      readonly curriculumVersionId?: string | null;
      readonly targetGradeLevels?: readonly number[];
      readonly primaryTopicId?: string | null;
      readonly secondaryTopicIds?: readonly string[];
      readonly objectiveIds?: readonly string[];
    },
    existing?: {
      readonly scope: ContentScopeEnum;
      readonly subjectId: string | null;
      readonly gradeId: string | null;
      readonly unitId: string | null;
      readonly curriculumVersionId: string | null;
      readonly targetGradeLevels?: readonly number[];
      readonly primaryTopicId?: string | null;
    }
  ): Promise<ResolvedHierarchy> {
    const scope = input.scope ?? existing?.scope ?? "TOPIC";
    const targetGradeLevels =
      input.targetGradeLevels ?? existing?.targetGradeLevels ?? [];

    if (scope === "TOPIC") {
      const topicId = input.primaryTopicId ?? existing?.primaryTopicId;
      if (!topicId) {
        throw new BadRequestError("Primary topic ID is required when scope is TOPIC");
      }

      const topicRecord = await this.repository.resolveTopicAncestry(topicId);
      if (!topicRecord) {
        throw new BadRequestError(`Topic ${topicId} not found`);
      }

      const resolvedUnitId = topicRecord.unitId;
      const resolvedSubjectId =
        topicRecord.unit?.curriculumSubject?.subjectId ?? null;
      const resolvedGradeId =
        topicRecord.unit?.curriculumSubject?.gradeId ?? null;
      const resolvedCurriculumVersionId =
        topicRecord.unit?.curriculumSubject?.curriculumVersionId ?? null;

      if (input.unitId && input.unitId !== resolvedUnitId) {
        throw new BadRequestError(
          "Provided unitId conflicts with the primary topic's unit"
        );
      }
      if (
        input.subjectId &&
        resolvedSubjectId &&
        input.subjectId !== resolvedSubjectId
      ) {
        throw new BadRequestError(
          "Provided subjectId conflicts with the primary topic's subject"
        );
      }
      if (
        input.gradeId &&
        resolvedGradeId &&
        input.gradeId !== resolvedGradeId
      ) {
        throw new BadRequestError(
          "Provided gradeId conflicts with the primary topic's grade"
        );
      }

      const validation = await this.repository.validateTopicAndObjectivesExist(
        tenantId,
        topicId,
        input.secondaryTopicIds ?? [],
        input.objectiveIds ?? []
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

      return {
        scope: "TOPIC",
        subjectId: resolvedSubjectId,
        gradeId: resolvedGradeId,
        unitId: resolvedUnitId,
        curriculumVersionId: resolvedCurriculumVersionId,
        targetGradeLevels,
        primaryTopicId: topicId,
        secondaryTopicIds: input.secondaryTopicIds ?? [],
        objectiveIds: input.objectiveIds ?? [],
      };
    }

    if (scope === "UNIT") {
      const unitId = input.unitId ?? existing?.unitId;
      if (!unitId) {
        throw new BadRequestError("Unit ID is required when scope is UNIT");
      }

      const unitRecord = await this.repository.resolveUnitAncestry(unitId);
      if (!unitRecord) {
        throw new BadRequestError(`Unit ${unitId} not found`);
      }

      const resolvedSubjectId =
        unitRecord.curriculumSubject?.subjectId ?? null;
      const resolvedGradeId =
        unitRecord.curriculumSubject?.gradeId ?? null;
      const resolvedCurriculumVersionId =
        unitRecord.curriculumSubject?.curriculumVersionId ?? null;

      if (
        input.subjectId &&
        resolvedSubjectId &&
        input.subjectId !== resolvedSubjectId
      ) {
        throw new BadRequestError(
          "Provided subjectId conflicts with the unit's subject"
        );
      }
      if (
        input.gradeId &&
        resolvedGradeId &&
        input.gradeId !== resolvedGradeId
      ) {
        throw new BadRequestError(
          "Provided gradeId conflicts with the unit's grade"
        );
      }

      return {
        scope: "UNIT",
        subjectId: resolvedSubjectId,
        gradeId: resolvedGradeId,
        unitId,
        curriculumVersionId: resolvedCurriculumVersionId,
        targetGradeLevels,
        primaryTopicId: null,
        secondaryTopicIds: [],
        objectiveIds: [],
      };
    }

    if (scope === "GRADE_SUBJECT") {
      const subjectId = input.subjectId ?? existing?.subjectId;
      let gradeId = input.gradeId ?? existing?.gradeId ?? null;

      if (!subjectId) {
        throw new BadRequestError(
          "Subject ID is required when scope is GRADE_SUBJECT"
        );
      }
      if (!gradeId && targetGradeLevels.length === 0) {
        throw new BadRequestError(
          "Grade ID or target grade levels are required when scope is GRADE_SUBJECT"
        );
      }

      const primaryLevel = targetGradeLevels[0];
      if (!gradeId && primaryLevel !== undefined) {
        gradeId = await this.repository.findGradeIdByLevel(primaryLevel);
      }

      const subjectExists = await this.repository.verifySubjectExists(subjectId);
      if (!subjectExists) {
        throw new BadRequestError(`Subject ${subjectId} not found`);
      }

      if (gradeId) {
        const gradeExists = await this.repository.verifyGradeExists(gradeId);
        if (!gradeExists) {
          throw new BadRequestError(`Grade ${gradeId} not found`);
        }
      }

      const resolvedCurriculumVersionId = gradeId
        ? (input.curriculumVersionId ??
          existing?.curriculumVersionId ??
          (await this.repository.findCurriculumVersionForGradeSubject(
            gradeId,
            subjectId
          )))
        : null;

      return {
        scope: "GRADE_SUBJECT",
        subjectId,
        gradeId,
        unitId: null,
        curriculumVersionId: resolvedCurriculumVersionId,
        targetGradeLevels,
        primaryTopicId: null,
        secondaryTopicIds: [],
        objectiveIds: [],
      };
    }

    if (scope === "SUBJECT") {
      const subjectId = input.subjectId ?? existing?.subjectId;
      if (!subjectId) {
        throw new BadRequestError(
          "Subject ID is required when scope is SUBJECT"
        );
      }

      const subjectExists = await this.repository.verifySubjectExists(subjectId);
      if (!subjectExists) {
        throw new BadRequestError(`Subject ${subjectId} not found`);
      }

      return {
        scope: "SUBJECT",
        subjectId,
        gradeId: null,
        unitId: null,
        curriculumVersionId: null,
        targetGradeLevels,
        primaryTopicId: null,
        secondaryTopicIds: [],
        objectiveIds: [],
      };
    }

    throw new BadRequestError(`Invalid content scope: ${String(scope)}`);
  }

  async listContent(
    tenantId: string,
    filters: ContentFilterQuery,
    userContext?: UserAuthContext
  ): Promise<PaginatedContentResult> {
    let effectiveFilters: ContentFilterQuery = { ...filters };

    if (userContext) {
      const isStudent =
        userContext.roles.includes("STUDENT") &&
        !userContext.roles.includes("TEACHER") &&
        !userContext.roles.includes("SCHOOL_ADMIN") &&
        !userContext.roles.includes("SYSTEM_ADMIN");

      if (isStudent) {
        const studentGradeId = await this.repository.resolveStudentEnrolledGradeId(
          tenantId,
          userContext.userId
        );
        effectiveFilters = {
          ...effectiveFilters,
          status: "PUBLISHED",
          ...(studentGradeId ? { gradeId: studentGradeId } : {}),
        };
      }
    }

    const { items, total } = await this.repository.findManyWithFilters(
      tenantId,
      effectiveFilters
    );

    const page = effectiveFilters.page ?? 1;
    const limit = effectiveFilters.limit ?? 20;
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
        scope: item.scope as ContentScopeEnum,
        source: item.source as ContentSourceTypeEnum,
        status: item.status as ContentStatusEnum,
        currentVersion: item.currentVersion,
        authorId: item.authorId,
        authorName: item.author
          ? `${item.author.firstName} ${item.author.lastName}`.trim()
          : undefined,
        subjectId: item.subjectId,
        subjectName: item.subject?.name ?? null,
        gradeId: item.gradeId,
        gradeLevel: item.grade?.level ?? null,
        unitId: item.unitId,
        unitTitle: item.unit?.title ?? null,
        curriculumVersionId: item.curriculumVersionId,
        targetGradeLevels: item.targetGradeLevels ?? [],
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
    id: string,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const item = await this.repository.findById(tenantId, id);
    if (!item) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (userContext) {
      const isStudent =
        userContext.roles.includes("STUDENT") &&
        !userContext.roles.includes("TEACHER") &&
        !userContext.roles.includes("SCHOOL_ADMIN") &&
        !userContext.roles.includes("SYSTEM_ADMIN");

      if (isStudent && item.status !== "PUBLISHED") {
        throw new NotFoundError(`Learning content ${id} not found`);
      }
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
      scope: item.scope as ContentScopeEnum,
      source: item.source as ContentSourceTypeEnum,
      status: item.status as ContentStatusEnum,
      currentVersion: item.currentVersion,
      authorId: item.authorId,
      authorName: item.author
        ? `${item.author.firstName} ${item.author.lastName}`.trim()
        : undefined,
      subjectId: item.subjectId,
      subjectName: item.subject?.name ?? null,
      gradeId: item.gradeId,
      gradeLevel: item.grade?.level ?? null,
      unitId: item.unitId,
      unitTitle: item.unit?.title ?? null,
      curriculumVersionId: item.curriculumVersionId,
      targetGradeLevels: item.targetGradeLevels ?? [],
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

  private async verifyTeacherAssignment(
    tenantId: string,
    userId: string,
    subjectId?: string | null,
    gradeId?: string | null
  ): Promise<void> {
    const assignments = await this.repository.findTeacherActiveAssignments(
      tenantId,
      userId
    );
    if (!assignments || assignments.length === 0) {
      throw new ForbiddenError(
        "You have no active teaching assignments in this institution"
      );
    }

    const assignedSubjectIds = new Set(
      assignments
        .map((a) => a.subjectId)
        .filter((id): id is string => Boolean(id))
    );
    const assignedGradeIds = new Set(
      assignments
        .map((a) => a.section?.gradeId)
        .filter((id): id is string => Boolean(id))
    );

    if (
      subjectId &&
      assignedSubjectIds.size > 0 &&
      !assignedSubjectIds.has(subjectId)
    ) {
      throw new ForbiddenError("You are not assigned to teach this subject");
    }

    if (
      gradeId &&
      assignedGradeIds.size > 0 &&
      !assignedGradeIds.has(gradeId)
    ) {
      throw new ForbiddenError("You are not assigned to teach this grade level");
    }
  }

  private verifyAuthorOrAdmin(
    existing: { readonly authorId: string; readonly status: string },
    userContext: UserAuthContext | undefined,
    action: string
  ): void {
    if (!userContext) return;
    const isAdmin =
      userContext.roles.includes("SCHOOL_ADMIN") ||
      userContext.roles.includes("SYSTEM_ADMIN") ||
      userContext.roles.includes("ADMIN");
    if (isAdmin) return;

    if (existing.authorId !== userContext.userId) {
      throw new ForbiddenError(
        `You can only ${action} content that you authored`
      );
    }
  }

  async createContent(
    tenantId: string,
    authorId: string,
    data: CreateLearningContentDto,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const hierarchy = await this.resolveAndValidateHierarchy(tenantId, data);

    if (userContext) {
      const isTeacherOnly =
        userContext.roles.includes("TEACHER") &&
        !userContext.roles.includes("SCHOOL_ADMIN") &&
        !userContext.roles.includes("SYSTEM_ADMIN") &&
        !userContext.roles.includes("ADMIN");

      if (isTeacherOnly) {
        const subjectId = hierarchy.subjectId ?? data.subjectId;
        const gradeId = hierarchy.gradeId ?? data.gradeId;
        await this.verifyTeacherAssignment(
          tenantId,
          authorId,
          subjectId,
          gradeId
        );
      }
    }

    const created = await this.repository.createContentWithResolvedHierarchy(
      tenantId,
      authorId,
      data,
      hierarchy
    );

    if (!created) {
      throw new BadRequestError("Failed to create learning content record");
    }

    return this.getContentDetail(tenantId, created.id);
  }

  async updateContentMetadata(
    tenantId: string,
    id: string,
    data: UpdateLearningContentDto,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    this.verifyAuthorOrAdmin(existing, userContext, "update");

    let hierarchy: ResolvedHierarchy | undefined;
    if (
      data.scope ||
      data.subjectId !== undefined ||
      data.gradeId !== undefined ||
      data.unitId !== undefined ||
      data.curriculumVersionId !== undefined ||
      data.targetGradeLevels !== undefined
    ) {
      hierarchy = await this.resolveAndValidateHierarchy(
        tenantId,
        {
          scope: data.scope,
          subjectId: data.subjectId,
          gradeId: data.gradeId,
          unitId: data.unitId,
          curriculumVersionId: data.curriculumVersionId,
          targetGradeLevels: data.targetGradeLevels,
        },
        {
          scope: existing.scope as ContentScopeEnum,
          subjectId: existing.subjectId,
          gradeId: existing.gradeId,
          unitId: existing.unitId,
          curriculumVersionId: existing.curriculumVersionId,
          targetGradeLevels: existing.targetGradeLevels,
          primaryTopicId:
            existing.topics.find((t) => t.isPrimary)?.topicId ||
            existing.topics[0]?.topicId ||
            null,
        }
      );
    }

    await this.repository.updateMetadataAndHierarchy(
      tenantId,
      id,
      data,
      hierarchy
    );
    return this.getContentDetail(tenantId, id);
  }

  async updateContentMappings(
    tenantId: string,
    id: string,
    data: UpdateContentMappingsDto,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    this.verifyAuthorOrAdmin(existing, userContext, "update mappings for");

    const hierarchy = await this.resolveAndValidateHierarchy(
      tenantId,
      {
        scope: data.scope,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        unitId: data.unitId,
        curriculumVersionId: data.curriculumVersionId,
        targetGradeLevels: data.targetGradeLevels,
        primaryTopicId: data.primaryTopicId,
        secondaryTopicIds: data.secondaryTopicIds,
        objectiveIds: data.objectiveIds,
      },
      {
        scope: existing.scope as ContentScopeEnum,
        subjectId: existing.subjectId,
        gradeId: existing.gradeId,
        unitId: existing.unitId,
        curriculumVersionId: existing.curriculumVersionId,
        targetGradeLevels: existing.targetGradeLevels,
        primaryTopicId:
          existing.topics.find((t) => t.isPrimary)?.topicId ||
          existing.topics[0]?.topicId ||
          null,
      }
    );

    await this.repository.updateMappingsAndHierarchy(tenantId, id, hierarchy);
    return this.getContentDetail(tenantId, id);
  }

  async saveNewVersion(
    tenantId: string,
    contentId: string,
    createdById: string,
    data: CreateContentVersionDto,
    userContext?: UserAuthContext
  ): Promise<ContentVersionResponse> {
    const existing = await this.repository.findById(tenantId, contentId);
    if (!existing) {
      throw new NotFoundError(`Learning content ${contentId} not found`);
    }

    this.verifyAuthorOrAdmin(existing, userContext, "create a new version for");

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
    id: string,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (userContext) {
      const isAdmin =
        userContext.roles.includes("SCHOOL_ADMIN") ||
        userContext.roles.includes("SYSTEM_ADMIN") ||
        userContext.roles.includes("ADMIN");

      if (!isAdmin && existing.authorId !== userContext.userId) {
        throw new ForbiddenError(
          "You can only submit your own authored content for review"
        );
      }
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestError(
        `Content in ${existing.status} status cannot be submitted for review`
      );
    }

    await this.repository.updateStatus(tenantId, id, "PENDING_REVIEW");
    return this.getContentDetail(tenantId, id);
  }

  async approveContent(
    tenantId: string,
    id: string,
    reviewerId: string
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (existing.status !== "PENDING_REVIEW") {
      throw new BadRequestError(
        `Only content in PENDING_REVIEW status can be approved. Current status: ${existing.status}`
      );
    }

    await this.repository.updateStatus(tenantId, id, "APPROVED", reviewerId);
    return this.getContentDetail(tenantId, id);
  }

  async publishContent(
    tenantId: string,
    id: string,
    userId: string,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (existing.status === "PUBLISHED") {
      return this.getContentDetail(tenantId, id, userContext);
    }

    const isAdmin =
      userContext?.roles.includes("SCHOOL_ADMIN") ||
      userContext?.roles.includes("SYSTEM_ADMIN") ||
      userContext?.roles.includes("ADMIN");

    const isTextbookOrReference =
      existing.type === "TEXTBOOK" || existing.type === "REFERENCE_BOOK";

    if (!isAdmin) {
      if (existing.authorId !== userId) {
        throw new ForbiddenError(
          "You can only publish content that you authored"
        );
      }

      await this.verifyTeacherAssignment(
        tenantId,
        userId,
        existing.subjectId,
        existing.gradeId
      );

      if (isTextbookOrReference && existing.status !== "APPROVED") {
        throw new ForbiddenError(
          "Textbooks and Reference Books require approval by a School Admin before publishing"
        );
      }
    } else {
      if (
        isTextbookOrReference &&
        existing.status !== "APPROVED" &&
        existing.status !== "PENDING_REVIEW"
      ) {
        throw new BadRequestError(
          "Textbooks and Reference Books must be in PENDING_REVIEW or APPROVED before publishing"
        );
      }
    }

    await this.repository.updateStatus(tenantId, id, "PUBLISHED", userId);
    return this.getContentDetail(tenantId, id, userContext);
  }

  async archiveContent(
    tenantId: string,
    id: string,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (userContext) {
      const isAdmin =
        userContext.roles.includes("SCHOOL_ADMIN") ||
        userContext.roles.includes("SYSTEM_ADMIN") ||
        userContext.roles.includes("ADMIN");

      if (!isAdmin && existing.authorId !== userContext.userId) {
        throw new ForbiddenError(
          "You can only archive content that you authored"
        );
      }
    }

    await this.repository.updateStatus(tenantId, id, "ARCHIVED");
    return this.getContentDetail(tenantId, id, userContext);
  }

  async activateContent(
    tenantId: string,
    id: string,
    userId: string,
    userContext?: UserAuthContext
  ): Promise<ContentDetailResponse> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (userContext) {
      const isAdmin =
        userContext.roles.includes("SCHOOL_ADMIN") ||
        userContext.roles.includes("SYSTEM_ADMIN") ||
        userContext.roles.includes("ADMIN");

      if (!isAdmin && existing.authorId !== userContext.userId) {
        throw new ForbiddenError(
          "You can only activate content that you authored"
        );
      }
    }

    await this.repository.updateStatus(tenantId, id, "PUBLISHED", userId);
    return this.getContentDetail(tenantId, id, userContext);
  }

  async deleteContent(
    tenantId: string,
    id: string,
    userContext?: UserAuthContext
  ): Promise<{ readonly deleted: boolean; readonly message: string }> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError(`Learning content ${id} not found`);
    }

    if (userContext) {
      const isAdmin =
        userContext.roles.includes("SCHOOL_ADMIN") ||
        userContext.roles.includes("SYSTEM_ADMIN") ||
        userContext.roles.includes("ADMIN");

      if (!isAdmin) {
        if (existing.authorId !== userContext.userId) {
          throw new ForbiddenError(
            "You can only delete content that you authored"
          );
        }
        if (existing.status !== "DRAFT" && existing.status !== "ARCHIVED") {
          throw new BadRequestError(
            "Teachers can only delete draft or archived content"
          );
        }
      }
    }

    if (existing.status === "DRAFT" || existing.status === "ARCHIVED") {
      if (existing.attachments && existing.attachments.length > 0) {
        for (const att of existing.attachments) {
          if (att.storageKey) {
            try {
              await this.attachmentService.deleteStorageFile(
                att.storageKey,
                att.mimeType
              );
            } catch {
              // Best-effort storage cleanup on deletion
            }
          }
        }
      }

      const deleted = await this.repository.deleteContentRecord(tenantId, id);
      return {
        deleted,
        message:
          existing.status === "DRAFT"
            ? "Draft content deleted successfully"
            : "Archived content deleted successfully",
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
