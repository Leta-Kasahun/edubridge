import { prisma } from "../../../lib/prisma.js";
import {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../types/question-bank.types.js";
import {
  QuestionTypeEnum,
  QuestionStatusEnum,
  DifficultyLevelEnum,
} from "../../../shared/constants/question-bank.constants.js";

const isValidUuid = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

const questionInclude = {
  versions: {
    orderBy: { version: "desc" as const },
    take: 1,
    include: {
      options: {
        orderBy: { orderIndex: "asc" as const },
      },
    },
  },
  topics: {
    include: {
      topic: {
        include: {
          unit: {
            include: {
              curriculumSubject: {
                include: {
                  grade: true,
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
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
};

export class QuestionRepository {
  async create(
    questionBankId: string,
    createdById: string,
    data: CreateQuestionInput
  ) {
    const versionNumber = 1;

    return prisma.question.create({
      data: {
        questionBankId,
        createdById,
        source: data.source || "TEACHER",
        status: "DRAFT",
        currentVersion: versionNumber,
        versions: {
          create: {
            version: versionNumber,
            type: data.type,
            difficulty: data.difficulty || "MEDIUM",
            questionText: data.questionText,
            explanation: data.explanation,
            points: data.points ?? 1,
            configuration: data.configuration ? JSON.parse(JSON.stringify(data.configuration)) : null,
            createdById,
            ...(data.options &&
              data.options.length > 0 && {
                options: {
                  create: data.options.map((opt, idx) => ({
                    optionKey: opt.optionKey,
                    optionText: opt.optionText,
                    orderIndex: opt.orderIndex ?? idx,
                    isCorrect: opt.isCorrect ?? false,
                  })),
                },
              }),
          },
        },
        ...(data.topicIds &&
          data.topicIds.length > 0 && {
            topics: {
              create: data.topicIds
                .filter((t) => isValidUuid(t.topicId))
                .map((t, idx) => ({
                  topicId: t.topicId,
                  isPrimary: t.isPrimary ?? idx === 0,
                })),
            },
          }),
        ...(data.objectiveIds &&
          data.objectiveIds.length > 0 && {
            objectives: {
              create: data.objectiveIds
                .filter((obj) => isValidUuid(obj.objectiveId))
                .map((obj) => ({
                  objectiveId: obj.objectiveId,
                })),
            },
          }),
      },
      include: questionInclude,
    });
  }

  async createMany(
    questionBankId: string,
    createdById: string,
    inputs: CreateQuestionInput[]
  ) {
    return prisma.$transaction(async (tx) => {
      const createdList = [];
      for (const data of inputs) {
        const created = await tx.question.create({
          data: {
            questionBankId,
            createdById,
            source: data.source || "TEACHER",
            status: "DRAFT",
            currentVersion: 1,
            versions: {
              create: {
                version: 1,
                type: data.type,
                difficulty: data.difficulty || "MEDIUM",
                questionText: data.questionText,
                explanation: data.explanation,
                points: data.points ?? 1,
                configuration: data.configuration ? JSON.parse(JSON.stringify(data.configuration)) : null,
                createdById,
                ...(data.options &&
                  data.options.length > 0 && {
                    options: {
                      create: data.options.map((opt, idx) => ({
                        optionKey: opt.optionKey,
                        optionText: opt.optionText,
                        orderIndex: opt.orderIndex ?? idx,
                        isCorrect: opt.isCorrect ?? false,
                      })),
                    },
                  }),
              },
            },
            ...(data.topicIds &&
              data.topicIds.length > 0 && {
                topics: {
                  create: data.topicIds
                    .filter((t) => isValidUuid(t.topicId))
                    .map((t, idx) => ({
                      topicId: t.topicId,
                      isPrimary: t.isPrimary ?? idx === 0,
                    })),
                },
              }),
            ...(data.objectiveIds &&
              data.objectiveIds.length > 0 && {
                objectives: {
                  create: data.objectiveIds
                    .filter((obj) => isValidUuid(obj.objectiveId))
                    .map((obj) => ({
                      objectiveId: obj.objectiveId,
                    })),
                },
              }),
          },
          include: questionInclude,
        });
        createdList.push(created);
      }
      return createdList;
    });
  }

  async findById(questionId: string, tenantId?: string) {
    if (!isValidUuid(questionId)) return null;

    const findByResolvedId = async (id: string) => {
      if (tenantId && isValidUuid(tenantId)) {
        const scoped = await prisma.question.findFirst({
          where: {
            id,
            questionBank: { tenantId },
          },
          include: {
            ...questionInclude,
            questionBank: true,
            versions: {
              orderBy: { version: "desc" },
              include: {
                options: {
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        });
        if (scoped) return scoped;
      }

      return prisma.question.findFirst({
        where: { id },
        include: {
          ...questionInclude,
          questionBank: true,
          versions: {
            orderBy: { version: "desc" },
            include: {
              options: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });
    };

    const direct = await findByResolvedId(questionId);
    if (direct) return direct;

    // Check if questionId is a questionVersionId
    const versionRecord = await prisma.questionVersion.findUnique({
      where: { id: questionId },
      select: { questionId: true },
    });

    if (versionRecord?.questionId) {
      return findByResolvedId(versionRecord.questionId);
    }

    return null;
  }

  async findManyByBank(
    questionBankId: string,
    filters: {
      status?: QuestionStatusEnum;
      type?: QuestionTypeEnum;
      difficulty?: DifficultyLevelEnum;
      unitId?: string;
      topicId?: string;
      objectiveId?: string;
      search?: string;
      page: number;
      limit: number;
    }
  ) {
    if (!isValidUuid(questionBankId)) {
      return {
        items: [],
        total: 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: 0,
      };
    }

    const where: Record<string, unknown> = { questionBankId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.unitId && isValidUuid(filters.unitId)) {
      where.topics = {
        some: {
          topic: {
            unitId: filters.unitId,
          },
        },
      };
    }

    if (filters.topicId && isValidUuid(filters.topicId)) {
      where.topics = {
        some: { topicId: filters.topicId },
      };
    }

    if (filters.objectiveId && isValidUuid(filters.objectiveId)) {
      where.objectives = {
        some: { objectiveId: filters.objectiveId },
      };
    }

    const versionWhere: Record<string, unknown> = {};
    if (filters.type) {
      versionWhere.type = filters.type;
    }
    if (filters.difficulty) {
      versionWhere.difficulty = filters.difficulty;
    }
    if (filters.search && filters.search.trim()) {
      versionWhere.questionText = {
        contains: filters.search.trim(),
        mode: "insensitive",
      };
    }

    if (Object.keys(versionWhere).length > 0) {
      where.versions = {
        some: versionWhere,
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: questionInclude,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async updateDraft(
    questionId: string,
    latestVersionId: string,
    data: UpdateQuestionInput
  ) {
    return prisma.$transaction(async (tx) => {
      if (
        data.type ||
        data.difficulty ||
        data.questionText !== undefined ||
        data.explanation !== undefined ||
        data.points !== undefined ||
        data.configuration !== undefined
      ) {
        await tx.questionVersion.update({
          where: { id: latestVersionId },
          data: {
            ...(data.type && { type: data.type }),
            ...(data.difficulty && { difficulty: data.difficulty }),
            ...(data.questionText && { questionText: data.questionText }),
            ...(data.explanation !== undefined && {
              explanation: data.explanation,
            }),
            ...(data.points !== undefined && { points: data.points }),
            ...(data.configuration !== undefined && {
              configuration: data.configuration ? JSON.parse(JSON.stringify(data.configuration)) : null,
            }),
          },
        });
      }

      if (data.options !== undefined) {
        await tx.questionOption.deleteMany({
          where: { questionVersionId: latestVersionId },
        });

        if (data.options.length > 0) {
          await tx.questionOption.createMany({
            data: data.options.map((opt, idx) => ({
              questionVersionId: latestVersionId,
              optionKey: opt.optionKey,
              optionText: opt.optionText,
              orderIndex: opt.orderIndex ?? idx,
              isCorrect: opt.isCorrect ?? false,
            })),
          });
        }
      }

      if (data.status) {
        await tx.question.update({
          where: { id: questionId },
          data: { status: data.status },
        });
      }

      if (data.topicIds !== undefined) {
        await tx.questionTopic.deleteMany({ where: { questionId } });
        if (data.topicIds.length > 0) {
          await tx.questionTopic.createMany({
            data: data.topicIds.map((t, idx) => ({
              questionId,
              topicId: t.topicId,
              isPrimary: t.isPrimary ?? idx === 0,
            })),
          });
        }
      }

      if (data.objectiveIds !== undefined) {
        await tx.questionObjective.deleteMany({ where: { questionId } });
        if (data.objectiveIds.length > 0) {
          await tx.questionObjective.createMany({
            data: data.objectiveIds.map((obj) => ({
              questionId,
              objectiveId: obj.objectiveId,
            })),
          });
        }
      }

      return tx.question.findUnique({
        where: { id: questionId },
        include: questionInclude,
      });
    });
  }

  async createNewVersion(
    questionId: string,
    newVersionNumber: number,
    userId: string,
    data: UpdateQuestionInput,
    previousVersion: {
      type: QuestionTypeEnum;
      difficulty: DifficultyLevelEnum;
      questionText: string;
      explanation: string | null;
      points: unknown;
      configuration: unknown;
      options: { optionKey: string; optionText: string; orderIndex: number; isCorrect: boolean }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data: {
          currentVersion: newVersionNumber,
          status: data.status || "DRAFT",
        },
      });

      const type = data.type || previousVersion.type;
      const difficulty = data.difficulty || previousVersion.difficulty;
      const questionText = data.questionText || previousVersion.questionText;
      const explanation =
        data.explanation !== undefined
          ? data.explanation
          : previousVersion.explanation;
      const points = data.points !== undefined ? data.points : Number(previousVersion.points);
      const configuration =
        data.configuration !== undefined
          ? data.configuration
          : (previousVersion.configuration as Record<string, unknown>);

      const options = data.options !== undefined ? data.options : previousVersion.options;

      const createdVersion = await tx.questionVersion.create({
        data: {
          questionId,
          version: newVersionNumber,
          type,
          difficulty,
          questionText,
          explanation,
          points,
          configuration: configuration ? JSON.parse(JSON.stringify(configuration)) : null,
          createdById: userId,
          ...(options &&
            options.length > 0 && {
              options: {
                create: options.map((opt, idx) => ({
                  optionKey: opt.optionKey,
                  optionText: opt.optionText,
                  orderIndex: opt.orderIndex ?? idx,
                  isCorrect: opt.isCorrect ?? false,
                })),
              },
            }),
        },
      });

      return tx.question.findUnique({
        where: { id: questionId },
        include: {
          ...questionInclude,
          versions: {
            where: { id: createdVersion.id },
            include: {
              options: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });
    });
  }

  async publish(questionId: string, latestVersionId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.questionVersion.update({
        where: { id: latestVersionId },
        data: { publishedAt: new Date() },
      });

      return tx.question.update({
        where: { id: questionId },
        data: { status: "PUBLISHED" },
        include: {
          ...questionInclude,
          versions: {
            where: { id: latestVersionId },
            include: {
              options: true,
            },
          },
        },
      });
    });
  }

  async delete(questionId: string) {
    return prisma.question.delete({
      where: { id: questionId },
    });
  }
}
