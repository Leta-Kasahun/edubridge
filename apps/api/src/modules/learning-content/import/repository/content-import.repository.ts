import { prisma, runWithTenant } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { ValidatedContentImportRow } from "../types/content-import.types.js";

export class ContentImportRepository {
  async findTopicsByCodes(
    tenantId: string,
    topicCodes: readonly string[],
    curriculumVersionId?: string
  ) {
    return runWithTenant({ tenantId }, async () => {
      const where: Prisma.CurriculumTopicWhereInput = {
        code: { in: [...topicCodes] },
      };

      if (curriculumVersionId) {
        where.unit = {
          curriculumSubject: {
            curriculumVersionId,
          },
        };
      }

      return prisma.curriculumTopic.findMany({
        where,
        select: {
          id: true,
          code: true,
          title: true,
          unitId: true,
        },
      });
    });
  }

  async findObjectivesByCodes(
    tenantId: string,
    objectiveCodes: readonly string[],
    curriculumVersionId?: string
  ) {
    return runWithTenant({ tenantId }, async () => {
      const where: Prisma.LearningObjectiveWhereInput = {
        code: { in: [...objectiveCodes] },
      };

      if (curriculumVersionId) {
        where.topic = {
          unit: {
            curriculumSubject: {
              curriculumVersionId,
            },
          },
        };
      }

      return prisma.learningObjective.findMany({
        where,
        select: {
          id: true,
          code: true,
          description: true,
          topicId: true,
        },
      });
    });
  }

  async commitImportBatch(
    tenantId: string,
    authorId: string,
    validRows: readonly ValidatedContentImportRow[]
  ): Promise<readonly string[]> {
    return runWithTenant({ tenantId }, async () => {
      const createdIds: string[] = [];

      await prisma.$transaction(async (tx) => {
        for (const row of validRows) {
          if (!row.topicId) continue;

          const initialBody: Prisma.InputJsonValue = {
            text: row.initialText || "",
            resourceUrl: row.resourceUrl || null,
            attachmentIds: [],
          };

          const content = await tx.learningContent.create({
            data: {
              tenantId,
              authorId,
              title: row.title,
              description: row.description,
              type: row.type,
              source: "SYSTEM",
              status: "DRAFT",
              currentVersion: 1,
              versions: {
                create: {
                  version: 1,
                  body: initialBody,
                  changeNote: "Imported via CSV/Excel batch",
                  createdById: authorId,
                },
              },
              topics: {
                create: {
                  topicId: row.topicId,
                  isPrimary: true,
                },
              },
            },
          });

          if (row.objectiveId) {
            await tx.contentObjective.create({
              data: {
                contentId: content.id,
                objectiveId: row.objectiveId,
              },
            });
          }

          createdIds.push(content.id);
        }
      });

      return createdIds;
    });
  }
}

export const contentImportRepository = new ContentImportRepository();
