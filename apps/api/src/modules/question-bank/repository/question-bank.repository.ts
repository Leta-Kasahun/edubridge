import { prisma } from "../../../lib/prisma.js";
import {
  CreateQuestionBankInput,
  UpdateQuestionBankInput,
} from "../types/question-bank.types.js";
import { QuestionBankStatusEnum } from "../../../shared/constants/question-bank.constants.js";

const isValidUuid = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export class QuestionBankRepository {
  async create(tenantId: string, createdById: string, data: CreateQuestionBankInput) {
    let contextIdToConnect = data.examContextId && isValidUuid(data.examContextId) ? data.examContextId : null;

    if (!contextIdToConnect && (data.subjectId || data.gradeId)) {
      const existing = await prisma.examContext.findFirst({
        where: {
          tenantId,
          ...(data.subjectId && isValidUuid(data.subjectId) && { subjectId: data.subjectId }),
          ...(data.gradeId && isValidUuid(data.gradeId) && { gradeId: data.gradeId }),
        },
      });
      if (existing) {
        contextIdToConnect = existing.id;
      } else if (data.subjectId || data.gradeId) {
        const createdContext = await prisma.examContext.create({
          data: {
            tenantId,
            name: `${data.name} Framework`,
            code: `EC-${Date.now().toString(36).toUpperCase()}`,
            scope: "GENERAL",
            status: "ACTIVE",
            ...(data.subjectId && isValidUuid(data.subjectId) && { subjectId: data.subjectId }),
            ...(data.gradeId && isValidUuid(data.gradeId) && { gradeId: data.gradeId }),
          },
        });
        contextIdToConnect = createdContext.id;
      }
    }

    return prisma.questionBank.create({
      data: {
        tenantId,
        createdById,
        name: data.name,
        description: data.description,
        status: "DRAFT",
        ...(contextIdToConnect && {
          examContexts: {
            connect: [{ id: contextIdToConnect }],
          },
        }),
      },
      include: {
        examContexts: {
          include: {
            grade: true,
            subject: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }

  async findById(tenantId: string | null, id: string) {
    if (!isValidUuid(id)) return null;
    return prisma.questionBank.findFirst({
      where: {
        id,
        ...(tenantId && isValidUuid(tenantId) && { tenantId }),
      },
      include: {
        examContexts: {
          include: {
            grade: true,
            subject: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }

  async findMany(
    tenantId: string | null,
    filters: {
      status?: QuestionBankStatusEnum;
      search?: string;
      examContextId?: string;
      subjectId?: string;
      gradeId?: string;
      createdById?: string;
      page: number;
      limit: number;
    }
  ) {
    const where: Record<string, unknown> = {};

    if (tenantId && isValidUuid(tenantId)) {
      where.tenantId = tenantId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdById && isValidUuid(filters.createdById)) {
      where.createdById = filters.createdById;
    }

    if (filters.examContextId && isValidUuid(filters.examContextId)) {
      where.examContexts = {
        some: { id: filters.examContextId },
      };
    } else if (
      (filters.subjectId && isValidUuid(filters.subjectId)) ||
      (filters.gradeId && isValidUuid(filters.gradeId))
    ) {
      where.examContexts = {
        some: {
          ...(filters.subjectId && isValidUuid(filters.subjectId) && { subjectId: filters.subjectId }),
          ...(filters.gradeId && isValidUuid(filters.gradeId) && { gradeId: filters.gradeId }),
        },
      };
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: {
          examContexts: {
            include: {
              grade: true,
              subject: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              questions: true,
            },
          },
        },
      }),
      prisma.questionBank.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async update(tenantId: string, id: string, data: UpdateQuestionBankInput) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.examContextId !== undefined) {
      if (data.examContextId && isValidUuid(data.examContextId)) {
        updateData.examContexts = {
          set: [{ id: data.examContextId }],
        };
      } else {
        updateData.examContexts = {
          set: [],
        };
      }
    } else if (data.subjectId || data.gradeId) {
      const existing = await prisma.examContext.findFirst({
        where: {
          tenantId,
          ...(data.subjectId && isValidUuid(data.subjectId) && { subjectId: data.subjectId }),
          ...(data.gradeId && isValidUuid(data.gradeId) && { gradeId: data.gradeId }),
        },
      });
      if (existing) {
        updateData.examContexts = {
          set: [{ id: existing.id }],
        };
      }
    }

    return prisma.questionBank.update({
      where: { id },
      data: updateData,
      include: {
        examContexts: {
          include: {
            grade: true,
            subject: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }

  async delete(tenantId: string, id: string) {
    return prisma.questionBank.delete({
      where: { id },
    });
  }
}
