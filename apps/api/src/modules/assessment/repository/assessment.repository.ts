import { prisma } from "../../../lib/prisma.js";
import {
  Prisma,
  type Assessment,
  type AssessmentAssignment,
} from "../../../generated/prisma/client.js";
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
  AssessmentQueryFilters,
  AssessmentQuestionInput,
  AssignAssessmentDto,
} from "../types/assessment.types.js";

export class AssessmentRepository {
  async create(
    tenantId: string,
    createdById: string,
    dto: CreateAssessmentDto
  ): Promise<Assessment> {
    const { questions, ...assessmentData } = dto;

    return prisma.assessment.create({
      data: {
        tenantId,
        createdById,
        title: assessmentData.title,
        description: assessmentData.description ?? null,
        type: assessmentData.type,
        gradingMode: assessmentData.gradingMode ?? "AUTOMATIC",
        timeLimitMinutes: assessmentData.timeLimitMinutes ?? null,
        maxAttempts: assessmentData.maxAttempts ?? null,
        randomizeQuestions: assessmentData.randomizeQuestions ?? false,
        randomizeOptions: assessmentData.randomizeOptions ?? false,
        showResults: assessmentData.showResults ?? true,
        availableFrom: assessmentData.availableFrom ? new Date(assessmentData.availableFrom) : null,
        availableUntil: assessmentData.availableUntil ? new Date(assessmentData.availableUntil) : null,
        examContextId: assessmentData.examContextId ?? null,
        scope: assessmentData.scope ?? "TOPIC",
        subjectId: assessmentData.subjectId ?? null,
        gradeId: assessmentData.gradeId ?? null,
        unitId: assessmentData.unitId ?? null,
        topicId: assessmentData.topicId ?? null,
        curriculumVersionId: assessmentData.curriculumVersionId ?? null,
        questions: questions && questions.length > 0
          ? {
              create: questions.map((q) => ({
                questionVersionId: q.questionVersionId,
                orderIndex: q.orderIndex,
                points: new Prisma.Decimal(q.points),
              })),
            }
          : undefined,
      },
      include: {
        questions: {
          include: {
            questionVersion: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        examContext: true,
        subject: true,
        grade: true,
        unit: true,
        topic: true,
        curriculumVersion: true,
      },
    });
  }

  async findById(
    tenantId: string,
    id: string
  ): Promise<Assessment | null> {
    return prisma.assessment.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        questions: {
          include: {
            questionVersion: {
              include: {
                options: {
                  orderBy: { orderIndex: "asc" },
                },
                question: {
                  include: {
                    topics: { include: { topic: true } },
                    objectives: { include: { objective: true } },
                  },
                },
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        assignments: {
          include: {
            section: {
              include: {
                grade: true,
              },
            },
          },
        },
        examContext: true,
        subject: true,
        grade: true,
        unit: true,
        topic: true,
        curriculumVersion: true,
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            questions: true,
            assignments: true,
            attempts: true,
          },
        },
      },
    });
  }

  async list(tenantId: string, filters: AssessmentQueryFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentWhereInput = {
      tenantId,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.gradingMode && { gradingMode: filters.gradingMode }),
      ...(filters.scope && { scope: filters.scope }),
      ...(filters.subjectId && { subjectId: filters.subjectId }),
      ...(filters.gradeId && { gradeId: filters.gradeId }),
      ...(filters.unitId && { unitId: filters.unitId }),
      ...(filters.topicId && { topicId: filters.topicId }),
      ...(filters.curriculumVersionId && { curriculumVersionId: filters.curriculumVersionId }),
      ...(filters.examContextId && { examContextId: filters.examContextId }),
      ...(filters.academicYearId && {
        assignments: {
          some: {
            section: {
              academicYearId: filters.academicYearId,
            },
          },
        },
      }),
      ...(filters.createdById && { createdById: filters.createdById }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    };

    const sortBy = filters.sortBy ?? "createdAt";
    const sortOrder = filters.sortOrder ?? "desc";

    const [total, items] = await Promise.all([
      prisma.assessment.count({ where }),
      prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          examContext: {
            select: {
              id: true,
              name: true,
              code: true,
              scope: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          grade: {
            select: {
              id: true,
              level: true,
            },
          },
          unit: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              questions: true,
              assignments: true,
              attempts: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateAssessmentDto
  ): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id, tenantId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.gradingMode !== undefined && { gradingMode: dto.gradingMode }),
        ...(dto.timeLimitMinutes !== undefined && { timeLimitMinutes: dto.timeLimitMinutes }),
        ...(dto.maxAttempts !== undefined && { maxAttempts: dto.maxAttempts }),
        ...(dto.randomizeQuestions !== undefined && { randomizeQuestions: dto.randomizeQuestions }),
        ...(dto.randomizeOptions !== undefined && { randomizeOptions: dto.randomizeOptions }),
        ...(dto.showResults !== undefined && { showResults: dto.showResults }),
        ...(dto.availableFrom !== undefined && {
          availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        }),
        ...(dto.availableUntil !== undefined && {
          availableUntil: dto.availableUntil ? new Date(dto.availableUntil) : null,
        }),
        ...(dto.examContextId !== undefined && { examContextId: dto.examContextId }),
        ...(dto.scope !== undefined && { scope: dto.scope }),
        ...(dto.subjectId !== undefined && { subjectId: dto.subjectId }),
        ...(dto.gradeId !== undefined && { gradeId: dto.gradeId }),
        ...(dto.unitId !== undefined && { unitId: dto.unitId }),
        ...(dto.topicId !== undefined && { topicId: dto.topicId }),
        ...(dto.curriculumVersionId !== undefined && { curriculumVersionId: dto.curriculumVersionId }),
      },
      include: {
        questions: {
          include: {
            questionVersion: {
              include: {
                options: true,
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        examContext: true,
        subject: true,
        grade: true,
        unit: true,
        topic: true,
        curriculumVersion: true,
      },
    });
  }

  async setQuestions(
    tenantId: string,
    assessmentId: string,
    questions: AssessmentQuestionInput[]
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.findFirst({
        where: { id: assessmentId, tenantId },
        select: { id: true },
      });
      if (!assessment) return;

      await tx.assessmentQuestion.deleteMany({
        where: { assessmentId },
      });

      if (questions.length > 0) {
        await tx.assessmentQuestion.createMany({
          data: questions.map((q) => ({
            assessmentId,
            questionVersionId: q.questionVersionId,
            orderIndex: q.orderIndex,
            points: new Prisma.Decimal(q.points),
          })),
        });
      }
    });
  }

  async assignToSections(
    tenantId: string,
    assessmentId: string,
    createdById: string,
    dto: AssignAssessmentDto
  ): Promise<AssessmentAssignment[]> {
    return prisma.$transaction(async (tx) => {
      const createdAssignments: AssessmentAssignment[] = [];
      for (const sectionId of dto.sectionIds) {
        const existing = await tx.assessmentAssignment.findUnique({
          where: {
            assessmentId_sectionId: {
              assessmentId,
              sectionId,
            },
          },
        });

        if (existing) {
          const updated = await tx.assessmentAssignment.update({
            where: { id: existing.id },
            data: {
              status: "PUBLISHED",
              dueAt: dto.dueAt ? new Date(dto.dueAt) : existing.dueAt,
            },
            include: {
              section: true,
            },
          });
          createdAssignments.push(updated);
        } else {
          const created = await tx.assessmentAssignment.create({
            data: {
              assessmentId,
              sectionId,
              createdById,
              status: "PUBLISHED",
              dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
            },
            include: {
              section: true,
            },
          });
          createdAssignments.push(created);
        }
      }
      return createdAssignments;
    });
  }

  async findAssignmentById(
    tenantId: string,
    assignmentId: string
  ) {
    return prisma.assessmentAssignment.findFirst({
      where: {
        id: assignmentId,
        assessment: {
          tenantId,
        },
      },
      include: {
        assessment: {
          include: {
            questions: {
              include: {
                questionVersion: {
                  include: {
                    options: true,
                  },
                },
              },
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        section: {
          include: {
            grade: true,
          },
        },
      },
    });
  }

  async archive(tenantId: string, id: string): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id, tenantId },
      data: { status: "ARCHIVED" },
    });
  }

  async unarchive(tenantId: string, id: string): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id, tenantId },
      data: { status: "DRAFT" },
    });
  }
}
