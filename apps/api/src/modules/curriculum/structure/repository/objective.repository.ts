import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  LearningObjectiveRecord,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";

export class ObjectiveRepository {
  async findObjectivesByTopicId(
    topicId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<LearningObjectiveRecord>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const skip = (page - 1) * limit;

    const where = {
      topicId,
      ...(params.search
        ? {
            OR: [
              { statement: { contains: params.search, mode: "insensitive" as const } },
              { code: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, objectives] = await runWithoutTenant(() =>
      Promise.all([
        prisma.learningObjective.count({ where }),
        prisma.learningObjective.findMany({
          where,
          orderBy: { orderIndex: "asc" },
          skip,
          take: limit,
        }),
      ])
    );

    const data: LearningObjectiveRecord[] = objectives.map((o) => ({
      id: o.id,
      topicId: o.topicId,
      code: o.code,
      statement: o.statement,
      description: o.description,
      orderIndex: o.orderIndex,
      externalId: o.externalId,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findObjectiveById(id: string): Promise<LearningObjectiveRecord | null> {
    const objective = await runWithoutTenant(() =>
      prisma.learningObjective.findUnique({
        where: { id },
      })
    );

    if (!objective) return null;

    return {
      id: objective.id,
      topicId: objective.topicId,
      code: objective.code,
      statement: objective.statement,
      description: objective.description,
      orderIndex: objective.orderIndex,
      externalId: objective.externalId,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt,
    };
  }

  async findNextObjectiveOrderIndex(topicId: string): Promise<number> {
    const last = await runWithoutTenant(() =>
      prisma.learningObjective.findFirst({
        where: { topicId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      })
    );
    return (last?.orderIndex ?? 0) + 1;
  }

  async createObjective(
    input: CreateObjectiveInput
  ): Promise<LearningObjectiveRecord> {
    const orderIndex =
      input.orderIndex ??
      (await this.findNextObjectiveOrderIndex(input.topicId));

    const created = await runWithoutTenant(() =>
      prisma.learningObjective.create({
        data: {
          topicId: input.topicId,
          code: input.code || `LO-${orderIndex}`,
          statement: input.statement,
          description: input.description,
          orderIndex,
          externalId: input.externalId,
        },
      })
    );

    return {
      id: created.id,
      topicId: created.topicId,
      code: created.code,
      statement: created.statement,
      description: created.description,
      orderIndex: created.orderIndex,
      externalId: created.externalId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateObjective(
    id: string,
    input: UpdateObjectiveInput
  ): Promise<LearningObjectiveRecord> {
    const updated = await runWithoutTenant(() =>
      prisma.learningObjective.update({
        where: { id },
        data: {
          statement: input.statement,
          description: input.description,
          externalId: input.externalId,
        },
      })
    );

    return {
      id: updated.id,
      topicId: updated.topicId,
      code: updated.code,
      statement: updated.statement,
      description: updated.description,
      orderIndex: updated.orderIndex,
      externalId: updated.externalId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteObjective(id: string): Promise<void> {
    await runWithoutTenant(() =>
      prisma.learningObjective.delete({
        where: { id },
      })
    );
  }

  async reorderObjectives(topicId: string, orderedIds: readonly string[]): Promise<void> {
    await runWithoutTenant(() =>
      prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.learningObjective.update({
            where: { id },
            data: { orderIndex: index + 1 },
          })
        )
      )
    );
  }

  async getObjectiveContext(id: string) {
    return runWithoutTenant(() =>
      prisma.learningObjective.findUnique({
        where: { id },
        include: {
          topic: {
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
          },
        },
      })
    );
  }
}

export const objectiveRepository = new ObjectiveRepository();
