import { prisma, runWithTenant } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  CreateLearningContentDto,
  UpdateLearningContentDto,
  CreateContentVersionDto,
  ContentFilterQuery,
  ContentVersionBody,
} from "../types/content.types.js";
import { ContentStatusEnum, ContentScopeEnum } from "../../../../shared/constants/index.js";
import { NotFoundError } from "../../../../shared/exceptions/index.js";

export interface ResolvedHierarchy {
  readonly scope: ContentScopeEnum;
  readonly subjectId: string | null;
  readonly gradeId: string | null;
  readonly unitId: string | null;
  readonly curriculumVersionId: string | null;
  readonly targetGradeLevels: readonly number[];
  readonly primaryTopicId: string | null;
  readonly secondaryTopicIds: readonly string[];
  readonly objectiveIds: readonly string[];
}

export class ContentRepository {
  async resolveTopicAncestry(topicId: string) {
    return prisma.curriculumTopic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        unitId: true,
        unit: {
          select: {
            id: true,
            curriculumSubject: {
              select: {
                id: true,
                subjectId: true,
                gradeId: true,
                curriculumVersionId: true,
              },
            },
          },
        },
      },
    });
  }

  async resolveUnitAncestry(unitId: string) {
    return prisma.curriculumUnit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        curriculumSubject: {
          select: {
            id: true,
            subjectId: true,
            gradeId: true,
            curriculumVersionId: true,
          },
        },
      },
    });
  }

  async verifySubjectExists(subjectId: string): Promise<boolean> {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
    return subject !== null;
  }

  async verifyGradeExists(gradeId: string): Promise<boolean> {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      select: { id: true },
    });
    return grade !== null;
  }

  async findGradeIdByLevel(level: number): Promise<string | null> {
    const grade = await prisma.grade.findFirst({
      where: { level },
      select: { id: true },
    });
    return grade?.id ?? null;
  }

  async findCurriculumVersionForGradeSubject(
    gradeId: string,
    subjectId: string
  ): Promise<string | null> {
    const cs = await prisma.curriculumSubject.findFirst({
      where: { gradeId, subjectId },
      select: { curriculumVersionId: true },
      orderBy: { createdAt: "desc" },
    });
    return cs?.curriculumVersionId ?? null;
  }

  async findManyWithFilters(
    tenantId: string,
    filters: ContentFilterQuery
  ) {
    return runWithTenant({ tenantId }, async () => {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const skip = (page - 1) * limit;

      const conditions: Prisma.LearningContentWhereInput[] = [];

      if (filters.status) {
        conditions.push({ status: filters.status });
      }

      if (filters.type) {
        conditions.push({ type: filters.type });
      }

      if (filters.scope) {
        conditions.push({ scope: filters.scope });
      }

      if (filters.source) {
        conditions.push({ source: filters.source });
      }

      if (filters.authorId) {
        conditions.push({ authorId: filters.authorId });
      }

      if (filters.subjectId) {
        conditions.push({ subjectId: filters.subjectId });
      }

      if (filters.unitId) {
        conditions.push({ unitId: filters.unitId });
      }

      if (filters.curriculumVersionId) {
        conditions.push({ curriculumVersionId: filters.curriculumVersionId });
      }

      if (filters.search) {
        conditions.push({
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        });
      }

      if (filters.topicId) {
        conditions.push({
          topics: {
            some: {
              topicId: filters.topicId,
            },
          },
        });
      }

      if (filters.objectiveId) {
        conditions.push({
          objectives: {
            some: {
              objectiveId: filters.objectiveId,
            },
          },
        });
      }

      if (filters.gradeId) {
        const gradeRecord = await prisma.grade.findUnique({
          where: { id: filters.gradeId },
          select: { level: true },
        });

        if (gradeRecord) {
          conditions.push({
            OR: [
              { gradeId: filters.gradeId },
              { targetGradeLevels: { has: gradeRecord.level } },
            ],
          });
        } else {
          conditions.push({ gradeId: filters.gradeId });
        }
      } else if (filters.targetGradeLevel) {
        conditions.push({
          OR: [
            { targetGradeLevels: { has: filters.targetGradeLevel } },
            { grade: { level: filters.targetGradeLevel } },
          ],
        });
      }

      if (filters.academicYearId) {
        const sections = await prisma.section.findMany({
          where: { academicYearId: filters.academicYearId, tenantId },
          select: { gradeId: true, grade: { select: { level: true } } },
        });

        const activeGradeIds = Array.from(
          new Set(sections.map((s) => s.gradeId))
        );
        const activeLevels = Array.from(
          new Set(sections.map((s) => s.grade.level))
        );

        if (activeGradeIds.length > 0) {
          conditions.push({
            OR: [
              { gradeId: { in: activeGradeIds } },
              { targetGradeLevels: { hasSome: activeLevels } },
            ],
          });
        } else {
          conditions.push({
            id: "00000000-0000-0000-0000-000000000000",
          });
        }
      }

      const where: Prisma.LearningContentWhereInput = {
        tenantId,
        ...(conditions.length > 0 ? { AND: conditions } : {}),
      };

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
            subject: {
              select: { id: true, name: true, code: true },
            },
            grade: {
              select: { id: true, level: true },
            },
            unit: {
              select: { id: true, title: true, code: true },
            },
            curriculumVersion: {
              select: { id: true, name: true, code: true },
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
          subject: {
            select: { id: true, name: true, code: true },
          },
          grade: {
            select: { id: true, level: true },
          },
          unit: {
            select: { id: true, title: true, code: true },
          },
          curriculumVersion: {
            select: { id: true, name: true, code: true },
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

  async createContentWithResolvedHierarchy(
    tenantId: string,
    authorId: string,
    data: CreateLearningContentDto,
    hierarchy: ResolvedHierarchy
  ) {
    return runWithTenant({ tenantId }, async () => {
      const topicRecords: Prisma.ContentTopicCreateManyContentInput[] = [];

      if (hierarchy.primaryTopicId) {
        topicRecords.push({
          topicId: hierarchy.primaryTopicId,
          isPrimary: true,
        });

        for (const tid of hierarchy.secondaryTopicIds) {
          if (tid !== hierarchy.primaryTopicId) {
            topicRecords.push({ topicId: tid, isPrimary: false });
          }
        }
      }

      const objectiveRecords: Prisma.ContentObjectiveCreateManyContentInput[] =
        hierarchy.objectiveIds.map((oid) => ({ objectiveId: oid }));

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
          scope: hierarchy.scope,
          source: data.source ?? "TEACHER",
          status: "DRAFT",
          currentVersion: 1,
          subjectId: hierarchy.subjectId,
          gradeId: hierarchy.gradeId,
          unitId: hierarchy.unitId,
          curriculumVersionId: hierarchy.curriculumVersionId,
          targetGradeLevels: [...hierarchy.targetGradeLevels],
          versions: {
            create: {
              version: 1,
              body: initialBody,
              changeNote: data.changeNote ?? "Initial draft created",
              createdById: authorId,
            },
          },
          topics: topicRecords.length > 0 ? {
            createMany: {
              data: topicRecords,
              skipDuplicates: true,
            },
          } : undefined,
          objectives: objectiveRecords.length > 0 ? {
            createMany: {
              data: objectiveRecords,
              skipDuplicates: true,
            },
          } : undefined,
        },
      });
    });
  }

  async updateMetadataAndHierarchy(
    tenantId: string,
    id: string,
    data: UpdateLearningContentDto,
    hierarchy?: ResolvedHierarchy
  ) {
    return runWithTenant({ tenantId }, async () => {
      const updateData: Prisma.LearningContentUpdateInput = {
        title: data.title,
        description: data.description,
        type: data.type,
        source: data.source,
      };

      if (data.targetGradeLevels !== undefined) {
        updateData.targetGradeLevels = [...data.targetGradeLevels];
      }

      if (hierarchy) {
        updateData.scope = hierarchy.scope;
        updateData.targetGradeLevels = [...hierarchy.targetGradeLevels];
        updateData.subject = hierarchy.subjectId
          ? { connect: { id: hierarchy.subjectId } }
          : { disconnect: true };
        updateData.grade = hierarchy.gradeId
          ? { connect: { id: hierarchy.gradeId } }
          : { disconnect: true };
        updateData.unit = hierarchy.unitId
          ? { connect: { id: hierarchy.unitId } }
          : { disconnect: true };
        updateData.curriculumVersion = hierarchy.curriculumVersionId
          ? { connect: { id: hierarchy.curriculumVersionId } }
          : { disconnect: true };
      }

      return prisma.learningContent.update({
        where: { id, tenantId },
        data: updateData,
      });
    });
  }

  async updateMappingsAndHierarchy(
    tenantId: string,
    id: string,
    hierarchy: ResolvedHierarchy
  ) {
    return runWithTenant({ tenantId }, async () => {
      return prisma.$transaction(async (tx) => {
        await tx.contentTopic.deleteMany({ where: { contentId: id } });
        await tx.contentObjective.deleteMany({ where: { contentId: id } });

        if (hierarchy.primaryTopicId) {
          const topicRecords: Prisma.ContentTopicCreateManyInput[] = [
            { contentId: id, topicId: hierarchy.primaryTopicId, isPrimary: true },
            ...hierarchy.secondaryTopicIds
              .filter((tid) => tid !== hierarchy.primaryTopicId)
              .map((tid) => ({
                contentId: id,
                topicId: tid,
                isPrimary: false,
              })),
          ];

          await tx.contentTopic.createMany({
            data: topicRecords,
            skipDuplicates: true,
          });
        }

        if (hierarchy.objectiveIds.length > 0) {
          await tx.contentObjective.createMany({
            data: hierarchy.objectiveIds.map((oid) => ({
              contentId: id,
              objectiveId: oid,
            })),
            skipDuplicates: true,
          });
        }

        await tx.learningContent.update({
          where: { id, tenantId },
          data: {
            scope: hierarchy.scope,
            subjectId: hierarchy.subjectId,
            gradeId: hierarchy.gradeId,
            unitId: hierarchy.unitId,
            curriculumVersionId: hierarchy.curriculumVersionId,
            targetGradeLevels: [...hierarchy.targetGradeLevels],
          },
        });

        return tx.learningContent.findFirst({
          where: { id, tenantId },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
            subject: {
              select: { id: true, name: true, code: true },
            },
            grade: {
              select: { id: true, level: true },
            },
            unit: {
              select: { id: true, title: true, code: true },
            },
            curriculumVersion: {
              select: { id: true, name: true, code: true },
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
    });
  }

  async createNextVersion(
    tenantId: string,
    contentId: string,
    createdById: string,
    data: CreateContentVersionDto
  ) {
    return runWithTenant({ tenantId }, async () => {
      const versionBody: Prisma.InputJsonValue =
        data.body as unknown as Prisma.InputJsonValue;

      return prisma.$transaction(async (tx) => {
        const current = await tx.learningContent.findFirst({
          where: { id: contentId, tenantId },
          select: { currentVersion: true },
        });

        if (!current) {
          throw new NotFoundError("Content item not found");
        }

        const nextVersion = current.currentVersion + 1;

        const newVersionRecord = await tx.contentVersion.create({
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
        });

        await tx.learningContent.update({
          where: { id: contentId, tenantId },
          data: {
            currentVersion: nextVersion,
          },
        });

        return newVersionRecord;
      });
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
        include: {
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
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
      readonly metadata?: Record<string, unknown> | null;
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
          content: {
            tenantId,
            status: "PUBLISHED",
          },
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
    primaryTopicId: string | undefined,
    secondaryTopicIds: readonly string[],
    objectiveIds: readonly string[]
  ): Promise<{
    readonly isValid: boolean;
    readonly missingTopicIds: readonly string[];
    readonly missingObjectiveIds: readonly string[];
  }> {
    return runWithTenant({ tenantId }, async () => {
      const allTopicIds = Array.from(
        new Set([
          ...(primaryTopicId ? [primaryTopicId] : []),
          ...secondaryTopicIds,
        ])
      );

      let missingTopicIds: readonly string[] = [];
      if (allTopicIds.length > 0) {
        const existingTopics = await prisma.curriculumTopic.findMany({
          where: { id: { in: allTopicIds } },
          select: { id: true },
        });

        const existingTopicIdSet = new Set(existingTopics.map((t) => t.id));
        missingTopicIds = allTopicIds.filter(
          (id) => !existingTopicIdSet.has(id)
        );
      }

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
