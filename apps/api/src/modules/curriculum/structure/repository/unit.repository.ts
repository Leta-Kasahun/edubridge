import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  CurriculumUnitRecord,
  CreateUnitInput,
  UpdateUnitInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";

export class UnitRepository {
  async findUnitsBySubjectId(
    subjectId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<CurriculumUnitRecord>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const skip = (page - 1) * limit;

    const where = {
      curriculumSubjectId: subjectId,
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" as const } },
              { code: { contains: params.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, units] = await runWithoutTenant(() =>
      Promise.all([
        prisma.curriculumUnit.count({ where }),
        prisma.curriculumUnit.findMany({
          where,
          include: {
            _count: {
              select: { topics: true },
            },
          },
          orderBy: { orderIndex: "asc" },
          skip,
          take: limit,
        }),
      ])
    );

    const data: CurriculumUnitRecord[] = units.map((u) => ({
      id: u.id,
      curriculumSubjectId: u.curriculumSubjectId,
      code: u.code,
      title: u.title,
      description: u.description,
      orderIndex: u.orderIndex,
      externalId: u.externalId,
      topicCount: u._count.topics,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findUnitById(id: string): Promise<CurriculumUnitRecord | null> {
    const unit = await runWithoutTenant(() =>
      prisma.curriculumUnit.findUnique({
        where: { id },
        include: {
          _count: {
            select: { topics: true },
          },
        },
      })
    );

    if (!unit) return null;

    return {
      id: unit.id,
      curriculumSubjectId: unit.curriculumSubjectId,
      code: unit.code,
      title: unit.title,
      description: unit.description,
      orderIndex: unit.orderIndex,
      externalId: unit.externalId,
      topicCount: unit._count.topics,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }

  async findNextUnitOrderIndex(subjectId: string): Promise<number> {
    const last = await runWithoutTenant(() =>
      prisma.curriculumUnit.findFirst({
        where: { curriculumSubjectId: subjectId },
        orderBy: { orderIndex: "desc" },
        select: { orderIndex: true },
      })
    );
    return (last?.orderIndex ?? 0) + 1;
  }

  async createUnit(input: CreateUnitInput): Promise<CurriculumUnitRecord> {
    const orderIndex =
      input.orderIndex ??
      (await this.findNextUnitOrderIndex(input.curriculumSubjectId));

    const created = await runWithoutTenant(() =>
      prisma.curriculumUnit.create({
        data: {
          curriculumSubjectId: input.curriculumSubjectId,
          code: input.code || `U-${orderIndex}`,
          title: input.title,
          description: input.description,
          orderIndex,
          externalId: input.externalId,
        },
        include: {
          _count: {
            select: { topics: true },
          },
        },
      })
    );

    return {
      id: created.id,
      curriculumSubjectId: created.curriculumSubjectId,
      code: created.code,
      title: created.title,
      description: created.description,
      orderIndex: created.orderIndex,
      externalId: created.externalId,
      topicCount: created._count.topics,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateUnit(
    id: string,
    input: UpdateUnitInput
  ): Promise<CurriculumUnitRecord> {
    const updated = await runWithoutTenant(() =>
      prisma.curriculumUnit.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          externalId: input.externalId,
        },
        include: {
          _count: {
            select: { topics: true },
          },
        },
      })
    );

    return {
      id: updated.id,
      curriculumSubjectId: updated.curriculumSubjectId,
      code: updated.code,
      title: updated.title,
      description: updated.description,
      orderIndex: updated.orderIndex,
      externalId: updated.externalId,
      topicCount: updated._count.topics,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async countUnitDependencies(id: string): Promise<{
    readonly contentCount: number;
    readonly questionCount: number;
    readonly evidenceCount: number;
  }> {
    return runWithoutTenant(async () => {
      const [directContentCount, topicContentCount, questionCount, evidenceCount] = await Promise.all([
        prisma.learningContent.count({ where: { unitId: id } }),
        prisma.contentTopic.count({ where: { topic: { unitId: id } } }),
        prisma.questionTopic.count({ where: { topic: { unitId: id } } }),
        prisma.learningEvidence.count({ where: { topic: { unitId: id } } }),
      ]);
      return {
        contentCount: directContentCount + topicContentCount,
        questionCount,
        evidenceCount,
      };
    });
  }

  async deleteUnit(id: string): Promise<void> {
    await runWithoutTenant(() =>
      prisma.curriculumUnit.delete({
        where: { id },
      })
    );
  }

  async reorderUnits(subjectId: string, orderedIds: readonly string[]): Promise<void> {
    await runWithoutTenant(() =>
      prisma.$transaction(
        orderedIds.map((id, index) =>
          prisma.curriculumUnit.update({
            where: { id },
            data: { orderIndex: index + 1 },
          })
        )
      )
    );
  }

  async getUnitContext(id: string) {
    return runWithoutTenant(() =>
      prisma.curriculumUnit.findUnique({
        where: { id },
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
      })
    );
  }
}

export const unitRepository = new UnitRepository();
