import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  CurriculumTopicRecord,
  CreateTopicInput,
  UpdateTopicInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";

export class TopicRepository {
  async findTopicsByUnitId(
    unitId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<CurriculumTopicRecord>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const skip = (page - 1) * limit;

    const where = {
      unitId,
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" as const } },
              { code: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, topics] = await runWithoutTenant(() =>
      Promise.all([
        prisma.curriculumTopic.count({ where }),
        prisma.curriculumTopic.findMany({
          where,
          include: {
            _count: {
              select: { objectives: true },
            },
          },
          orderBy: { orderIndex: "asc" },
          skip,
          take: limit,
        }),
      ])
    );

    const data: CurriculumTopicRecord[] = topics.map((t) => ({
      id: t.id,
      unitId: t.unitId,
      code: t.code,
      title: t.title,
      description: t.description,
      orderIndex: t.orderIndex,
      externalId: t.externalId,
      objectiveCount: t._count.objectives,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findTopicById(id: string): Promise<CurriculumTopicRecord | null> {
    const topic = await runWithoutTenant(() =>
      prisma.curriculumTopic.findUnique({
        where: { id },
        include: {
          _count: {
            select: { objectives: true },
          },
        },
      })
    );

    if (!topic) return null;

    return {
      id: topic.id,
      unitId: topic.unitId,
      code: topic.code,
      title: topic.title,
      description: topic.description,
      orderIndex: topic.orderIndex,
      externalId: topic.externalId,
      objectiveCount: topic._count.objectives,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }

  async findNextTopicOrderIndex(unitId: string): Promise<number> {
    const last = await runWithoutTenant(() =>
      prisma.curriculumTopic.findFirst({
        where: { unitId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      })
    );
    return (last?.orderIndex ?? 0) + 1;
  }

  async createTopic(input: CreateTopicInput): Promise<CurriculumTopicRecord> {
    const orderIndex =
      input.orderIndex ?? (await this.findNextTopicOrderIndex(input.unitId));

    const created = await runWithoutTenant(() =>
      prisma.curriculumTopic.create({
        data: {
          unitId: input.unitId,
          code: input.code || `T-${orderIndex}`,
          title: input.title,
          description: input.description,
          orderIndex,
          externalId: input.externalId,
        },
        include: {
          _count: {
            select: { objectives: true },
          },
        },
      })
    );

    return {
      id: created.id,
      unitId: created.unitId,
      code: created.code,
      title: created.title,
      description: created.description,
      orderIndex: created.orderIndex,
      externalId: created.externalId,
      objectiveCount: created._count.objectives,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateTopic(
    id: string,
    input: UpdateTopicInput
  ): Promise<CurriculumTopicRecord> {
    const updated = await runWithoutTenant(() =>
      prisma.curriculumTopic.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          externalId: input.externalId,
        },
        include: {
          _count: {
            select: { objectives: true },
          },
        },
      })
    );

    return {
      id: updated.id,
      unitId: updated.unitId,
      code: updated.code,
      title: updated.title,
      description: updated.description,
      orderIndex: updated.orderIndex,
      externalId: updated.externalId,
      objectiveCount: updated._count.objectives,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async countTopicDependencies(id: string): Promise<{
    readonly contentCount: number;
    readonly questionCount: number;
    readonly evidenceCount: number;
  }> {
    return runWithoutTenant(async () => {
      const [contentCount, questionCount, evidenceCount] = await Promise.all([
        prisma.contentTopic.count({ where: { topicId: id } }),
        prisma.questionTopic.count({ where: { topicId: id } }),
        prisma.learningEvidence.count({ where: { topicId: id } }),
      ]);
      return { contentCount, questionCount, evidenceCount };
    });
  }

  async deleteTopic(id: string): Promise<void> {
    await runWithoutTenant(() =>
      prisma.curriculumTopic.delete({
        where: { id },
      })
    );
  }

  async reorderTopics(unitId: string, orderedIds: readonly string[]): Promise<void> {
    await runWithoutTenant(() =>
      prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.curriculumTopic.update({
            where: { id },
            data: { orderIndex: index + 1 },
          })
        )
      )
    );
  }

  async getTopicContext(id: string) {
    return runWithoutTenant(() =>
      prisma.curriculumTopic.findUnique({
        where: { id },
        include: {
          unit: {
            include: {
              curriculumSubject: {
                include: {
                  curriculumVersion: {
                    include: {
                      curriculum: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    );
  }
}

export const topicRepository = new TopicRepository();
