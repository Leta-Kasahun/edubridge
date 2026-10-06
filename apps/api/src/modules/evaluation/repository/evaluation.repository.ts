import { prisma } from "../../../lib/prisma.js";
import {
  Prisma,
  type AssessmentAttempt,
} from "../../../generated/prisma/client.js";
import type { AttemptStatus } from "../../../generated/prisma/enums.js";
import { ManualGradeAttemptDto } from "../types/evaluation.types.js";

export class EvaluationRepository {
  async findAttemptById(
    tenantId: string,
    attemptId: string
  ): Promise<
    | (AssessmentAttempt & {
        student: { user: { id: string } | null } | null;
        assessment: { id: string; title: string; tenantId: string };
      })
    | null
  > {
    return prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        assessment: { tenantId },
      },
      include: {
        student: {
          select: {
            user: { select: { id: true } },
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            tenantId: true,
          },
        },
      },
    });
  }

  async findAttemptResult(
    tenantId: string,
    assessmentId: string,
    attemptId: string
  ) {
    return prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        assessmentId,
        assessment: { tenantId },
      },
      include: {
        assessment: {
          include: {
            examContext: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            questions: {
              include: {
                questionVersion: {
                  include: {
                    options: {
                      orderBy: { orderIndex: "asc" },
                    },
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        answers: {
          include: {
            questionVersion: {
              include: {
                options: {
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findStudentProfileByUserId(tenantId: string, userId: string) {
    return prisma.studentProfile.findFirst({
      where: {
        userId,
        tenantId,
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async findAssessmentForAttempt(tenantId: string, assessmentId: string) {
    return prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        tenantId,
      },
      include: {
        assignments: {
          take: 1,
          select: { id: true },
        },
      },
    });
  }

  async applyManualGrading(
    tenantId: string,
    attemptId: string,
    gradedById: string,
    dto: ManualGradeAttemptDto
  ): Promise<AssessmentAttempt> {
    return prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.findFirstOrThrow({
        where: {
          id: attemptId,
          assessment: { tenantId },
        },
        include: {
          answers: true,
          assessment: {
            include: {
              questions: true,
            },
          },
        },
      });

      for (const gradeItem of dto.grades) {
        await tx.studentAnswer.upsert({
          where: {
            attemptId_questionVersionId: {
              attemptId,
              questionVersionId: gradeItem.questionVersionId,
            },
          },
          create: {
            attemptId,
            questionVersionId: gradeItem.questionVersionId,
            awardedPoints: new Prisma.Decimal(gradeItem.awardedPoints),
            feedback: gradeItem.feedback ?? null,
            gradedById,
            gradedAt: new Date(),
            status: "GRADED",
            isCorrect: Number(gradeItem.awardedPoints) > 0,
          },
          update: {
            awardedPoints: new Prisma.Decimal(gradeItem.awardedPoints),
            feedback: gradeItem.feedback ?? null,
            gradedById,
            gradedAt: new Date(),
            status: "GRADED",
            isCorrect: Number(gradeItem.awardedPoints) > 0,
          },
        });
      }

      const updatedAnswers = await tx.studentAnswer.findMany({
        where: { attemptId },
      });

      let totalAwarded = 0;
      let totalMax = 0;
      let hasUngraded = false;

      for (const q of attempt.assessment.questions) {
        const qPoints = Number(q.points) || 0;
        totalMax += qPoints;

        const ans = updatedAnswers.find(
          (a) => a.questionVersionId === q.questionVersionId
        );
        if (ans) {
          if (ans.status !== "GRADED") {
            hasUngraded = true;
          }
          totalAwarded += ans.awardedPoints ? Number(ans.awardedPoints) : 0;
        } else {
          hasUngraded = true;
        }
      }

      const percentage =
        totalMax > 0 ? Math.round((totalAwarded / totalMax) * 10000) / 100 : 0;
      const finalStatus: AttemptStatus = hasUngraded ? "GRADING" : "GRADED";

      let gradingVersionPayload = attempt.gradingVersion;
      if (dto.generalFeedback && dto.generalFeedback.trim()) {
        try {
          const current = attempt.gradingVersion ? JSON.parse(attempt.gradingVersion) : {};
          gradingVersionPayload = JSON.stringify({
            ...(typeof current === "object" && current !== null ? current : {}),
            generalFeedback: dto.generalFeedback.trim(),
            gradedAt: new Date().toISOString(),
          });
        } catch {
          gradingVersionPayload = JSON.stringify({
            generalFeedback: dto.generalFeedback.trim(),
            gradedAt: new Date().toISOString(),
          });
        }
      }

      return tx.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: finalStatus,
          score: new Prisma.Decimal(totalAwarded),
          maxScore: new Prisma.Decimal(totalMax),
          percentage: new Prisma.Decimal(percentage),
          gradingVersion: gradingVersionPayload,
          gradedAt: finalStatus === "GRADED" ? new Date() : attempt.gradedAt,
        },
        include: {
          answers: true,
          assessment: true,
        },
      });
    });
  }

  async listStudentResults(
    tenantId: string,
    studentId: string,
    filters: { page?: number; limit?: number } = {}
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentAttemptWhereInput = {
      assessment: { tenantId },
      studentId,
      status: { in: ["GRADED", "GRADING", "SUBMITTED"] },
    };

    const [total, items] = await Promise.all([
      prisma.assessmentAttempt.count({ where }),
      prisma.assessmentAttempt.findMany({
        where,
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              timeLimitMinutes: true,
              examContext: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              _count: {
                select: {
                  questions: true,
                },
              },
            },
          },
          answers: {
            select: {
              id: true,
              isCorrect: true,
              awardedPoints: true,
              feedback: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip,
        take: limit,
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
}
