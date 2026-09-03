import { prisma, runWithTenant } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  CreateLearningContentDto,
  UpdateLearningContentDto,
  UpdateContentMappingsDto,
  CreateContentVersionDto,
  ContentFilterQuery,
  ContentVersionBody,
} from "../types/content.types.js";
import { ContentStatusEnum } from "../../../../shared/constants/index.js";

export class ContentRepository {
  async findManyWithFilters(
    tenantId: string,
    filters: ContentFilterQuery
  ) {
    return runWithTenant({ tenantId }, async () => {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const skip = (page - 1) * limit;

      const where: Prisma.LearningContentWhereInput = {
        tenantId,
      };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.source) {
        where.source = filters.source;
      }

      if (filters.authorId) {
        where.authorId = filters.authorId;
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.topicId) {
        where.topics = {
          some: {
            topicId: filters.topicId,
          },
        };
      }

      if (filters.objectiveId) {
        where.objectives = {
          some: {
            objectiveId: filters.objectiveId,
          },
        };
      }

      if (filters.subjectId) {
        where.topics = {
          some: {
            topic: {
              unit: {
                curriculumSubject: {
                  subjectId: filters.subjectId,
                },
              },
            },
          },
        };
      }

      if (filters.curriculumVersionId) {
        where.topics = {
          some: {
            topic: {
              unit: {
                curriculumSubject: {
                  curriculumVersionId: filters.curriculumVersionId,
                },
              },
            },
          },
        };
      }

      const [items, total] = await Promise.all([
        prisma.learningContent.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
            topics: {
              include: {
                topic: {
                  include: {
                    unit: {
                      include: {
                        curriculumSubject: {
                          include: {
                            subject: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: { objectives: true, attachments: true },
            },
          },
        }),
        prisma.learningContent.count({ where }),
      ]);

      return { items, total };
    });
  }

  async findById(tenantId: string, id: string) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.learningContent.findFirst({
        where: { id, tenantId },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          topics: {
            include: {
              topic: {
                include: {
                  unit: {
                    include: {
                      curriculumSubject: {
                        include: {
                          subject: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          objectives: {
            include: {
              objective: true,
            },
          },
          versions: {
            orderBy: { version: "desc" },
            include: {
              createdBy: {
                select: { id: true, firstName: true, lastName: true },
              },
              reviewedBy: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
          attachments: {
            orderBy: { createdAt: "desc" },
            include: {
              uploadedBy: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      });
    });
  }

  async createContentWithVersionAndMappings(
    tenantId: string,
    authorId: string,
    data: CreateLearningContentDto
  ) {
    return runWithTenant({ tenantId }, async () => {
      const topicRecords: Prisma.ContentTopicCreateManyContentInput[] = [
        { topicId: data.primaryTopicId, isPrimary: true },
        ...(data.secondaryTopicIds ?? [])
          .filter((tid) => tid !== data.primaryTopicId)
          .map((tid) => ({ topicId: tid, isPrimary: false })),
      ];

      const objectiveRecords: Prisma.ContentObjectiveCreateManyContentInput[] = (
        data.objectiveIds ?? []
      ).map((oid) => ({ objectiveId: oid }));

      const initialBody: Prisma.InputJsonValue =
        (data.initialVersionBody as Prisma.InputJsonValue) ?? {
          text: "",
          attachmentIds: [],
        };

      return prisma.learningContent.create({
        data: {
          tenantId,
          authorId,
          title: data.title,
          description: data.description,
          type: data.type,
          source: data.source ?? "TEACHER",
          status: "DRAFT",
          currentVersion: 1,
          versions: {
            create: {
              version: 1,
              body: initialBody,
              changeNote: data.changeNote ?? "Initial draft created",
              createdById: authorId,
            },
          },
          topics: {
            createMany: {
              data: topicRecords,
              skipDuplicates: true,
            },
          },
          objectives: {
            createMany: {
              data: objectiveRecords,
              skipDuplicates: true,
            },
          },
        },
      });
    });
  }

  async updateMetadata(
    tenantId: string,
    id: string,
    data: UpdateLearningContentDto
  ) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.learningContent.update({
        where: { id, tenantId },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          source: data.source,
        },
      });
    });
  }

  async updateMappings(
    tenantId: string,
    id: string,
    data: UpdateContentMappingsDto
  ) {
    return runWithTenant({ tenantId }, async () => {
      await prisma.$transaction([
        prisma.contentTopic.deleteMany({ where: { contentId: id } }),
        prisma.contentObjective.deleteMany({ where: { contentId: id } }),
        prisma.contentTopic.createMany({
          data: [
            { contentId: id, topicId: data.primaryTopicId, isPrimary: true },
            ...(data.secondaryTopicIds ?? [])
              .filter((tid) => tid !== data.primaryTopicId)
              .map((tid) => ({
                contentId: id,
                topicId: tid,
                isPrimary: false,
              })),
          ],
          skipDuplicates: true,
        }),
        prisma.contentObjective.createMany({
          data: (data.objectiveIds ?? []).map((oid) => ({
            contentId: id,
            objectiveId: oid,
          })),
          skipDuplicates: true,
        }),
      ]);

      return this.findById(tenantId, id);
    });
  }

  async createNextVersion(
    tenantId: string,
    contentId: string,
    createdById: string,
    data: CreateContentVersionDto
  ) {
    return runWithTenant({ tenantId }, async () => {
      const current = await prisma.learningContent.findFirst({
        where: { id: contentId, tenantId },
        select: { currentVersion: true },
      });

      if (!current) {
        throw new Error("Content item not found");
      }

      const nextVersion = current.currentVersion + 1;
      const versionBody: Prisma.InputJsonValue =
        data.body as unknown as Prisma.InputJsonValue;

      const [newVersionRecord] = await prisma.$transaction([
        prisma.contentVersion.create({
          data: {
            contentId,
            version: nextVersion,
            body: versionBody,
            changeNote: data.changeNote ?? `Version ${nextVersion}`,
            createdById,
          },
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
        prisma.learningContent.update({
          where: { id: contentId, tenantId },
          data: {
            currentVersion: nextVersion,
          },
        }),
      ]);

      return newVersionRecord;
    });
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: ContentStatusEnum,
    reviewedById?: string
  ) {
    return runWithTenant({ tenantId }, async () => {
      const updateData: Prisma.LearningContentUpdateInput = {
        status,
      };

      const now = new Date();

      if (status === "PUBLISHED") {
        updateData.publishedAt = now;
      } else if (status === "ARCHIVED") {
        updateData.archivedAt = now;
      }

      const content = await prisma.learningContent.update({
        where: { id, tenantId },
        data: updateData,
      });

      if (status === "PUBLISHED" && content.currentVersion) {
        await prisma.contentVersion.updateMany({
          where: {
            contentId: id,
            version: content.currentVersion,
          },
          data: {
            publishedAt: now,
            reviewedById: reviewedById ?? undefined,
            reviewedAt: reviewedById ? now : undefined,
          },
        });
      }

      return content;
    });
  }

  async findVersionByNumber(
    tenantId: string,
    contentId: string,
    versionNumber: number
  ) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.contentVersion.findFirst({
        where: {
          contentId,
          version: versionNumber,
          content: { tenantId },
        },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          reviewedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  }

  async findVersionsByContentId(tenantId: string, contentId: string) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.contentVersion.findMany({
        where: {
          contentId,
          content: { tenantId },
        },
        orderBy: { version: "desc" },
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          reviewedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  }

  async deleteDraftContent(tenantId: string, id: string): Promise<boolean> {
    return runWithTenant({ tenantId }, async () => {
      const content = await prisma.learningContent.findFirst({
        where: { id, tenantId },
        select: { status: true },
      });

      if (!content || content.status !== "DRAFT") {
        return false;
      }

      await prisma.learningContent.delete({
        where: { id, tenantId },
      });

      return true;
    });
  }

  async findAttachmentById(tenantId: string, attachmentId: string) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.contentAttachment.findFirst({
        where: {
          id: attachmentId,
          content: { tenantId },
        },
      });
    });
  }

  async findAttachmentsByContentId(tenantId: string, contentId: string) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.contentAttachment.findMany({
        where: {
          contentId,
          content: { tenantId },
        },
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  }

  async findAttachmentsByIds(
    tenantId: string,
    attachmentIds: readonly string[]
  ) {
    return runWithTenant({ tenantId }, async () => {
      if (attachmentIds.length === 0) return [];
      return prisma.contentAttachment.findMany({
        where: {
          id: { in: [...attachmentIds] },
          content: { tenantId },
        },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  }

  async createAttachment(
    tenantId: string,
    contentId: string,
    uploadedById: string,
    data: {
      readonly fileName: string;
      readonly mimeType: string;
      readonly storageKey: string;
      readonly sizeBytes: bigint;
      readonly metadata?: Record<string, unknown>;
    }
  ) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.contentAttachment.create({
        data: {
          contentId,
          uploadedById,
          fileName: data.fileName,
          mimeType: data.mimeType,
          storageKey: data.storageKey,
          sizeBytes: data.sizeBytes,
          metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    });
  }

  async isAttachmentReferencedInPublishedVersion(
    tenantId: string,
    attachmentId: string
  ): Promise<boolean> {
    return runWithTenant({ tenantId }, async () => {
      const publishedVersions = await prisma.contentVersion.findMany({
        where: {
          content: { tenantId },
          publishedAt: { not: null },
        },
        select: { body: true },
      });

      for (const ver of publishedVersions) {
        if (ver.body && typeof ver.body === "object") {
          const bodyObj = ver.body as ContentVersionBody;
          if (
            Array.isArray(bodyObj.attachmentIds) &&
            bodyObj.attachmentIds.includes(attachmentId)
          ) {
            return true;
          }
        }
      }

      return false;
    });
  }

  async deleteAttachmentRecord(
    tenantId: string,
    attachmentId: string
  ): Promise<boolean> {
    return runWithTenant({ tenantId }, async () => {
      await prisma.contentAttachment.delete({
        where: { id: attachmentId },
      });
      return true;
    });
  }

  async validateTopicAndObjectivesExist(
    tenantId: string,
    primaryTopicId: string,
    secondaryTopicIds: readonly string[],
    objectiveIds: readonly string[]
  ): Promise<{
    readonly isValid: boolean;
    readonly missingTopicIds: readonly string[];
    readonly missingObjectiveIds: readonly string[];
  }> {
    return runWithTenant({ tenantId }, async () => {
      const allTopicIds = Array.from(
        new Set([primaryTopicId, ...secondaryTopicIds])
      );

      const existingTopics = await prisma.curriculumTopic.findMany({
        where: { id: { in: allTopicIds } },
        select: { id: true },
      });

      const existingTopicIdSet = new Set(existingTopics.map((t) => t.id));
      const missingTopicIds = allTopicIds.filter(
        (id) => !existingTopicIdSet.has(id)
      );

      let missingObjectiveIds: readonly string[] = [];
      if (objectiveIds.length > 0) {
        const existingObjectives = await prisma.learningObjective.findMany({
          where: { id: { in: [...objectiveIds] } },
          select: { id: true },
        });
        const existingObjectiveIdSet = new Set(
          existingObjectives.map((o) => o.id)
        );
        missingObjectiveIds = objectiveIds.filter(
          (id) => !existingObjectiveIdSet.has(id)
        );
      }

      const isValid =
        missingTopicIds.length === 0 && missingObjectiveIds.length === 0;

      return {
        isValid,
        missingTopicIds,
        missingObjectiveIds,
      };
    });
  }
}

export const contentRepository = new ContentRepository();
