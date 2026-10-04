import { prisma } from "../../../lib/prisma.js";
import {
  Prisma,
  type AssessmentAttempt,
  type StudentAnswer,
  type StudentProfile,
} from "../../../generated/prisma/client.js";
import type {
  AttemptStatus,
  AnswerStatus,
} from "../../../generated/prisma/enums.js";
import {
  AttemptQueryFilters,
  ManualGradeAttemptDto,
} from "../types/assessment.types.js";

export class AttemptRepository {
  async findStudentProfileByUserId(
    tenantId: string,
    userId: string
  ): Promise<StudentProfile | null> {
    const profile = await prisma.studentProfile.findFirst({
      where: {
        userId,
        tenantId,
        status: "ACTIVE",
      },
    });
    if (profile) return profile;

    return prisma.studentProfile.findFirst({
      where: {
        userId,
      },
    });
  }

  async ensureStudentProfileForUser(
    tenantId: string,
    userId: string
  ): Promise<StudentProfile> {
    const existing = await this.findStudentProfileByUserId(tenantId, userId);
    if (existing) return existing;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return prisma.studentProfile.create({
      data: {
        userId,
        tenantId,
        studentCode: `STU-${Date.now().toString(36).toUpperCase()}`,
        firstName: user?.firstName || "Student",
        middleName: "",
        lastName: user?.lastName || "User",
        gender: "MALE",
        status: "ACTIVE",
      },
    });
  }

  async ensureAssignmentForAssessment(
    tenantId: string,
    userId: string,
    assessmentId: string,
    preferredAssignmentId?: string | null
  ): Promise<string> {
    if (preferredAssignmentId && preferredAssignmentId.trim()) {
      const existing = await prisma.assessmentAssignment.findFirst({
        where: { id: preferredAssignmentId, assessmentId },
      });
      if (existing) return existing.id;
    }

    const anyAssignment = await prisma.assessmentAssignment.findFirst({
      where: { assessmentId },
    });
    if (anyAssignment) return anyAssignment.id;

    let section = await prisma.section.findFirst({
      where: { tenantId, status: "ACTIVE" },
    });
    if (!section) {
      section = await prisma.section.findFirst({
        where: { status: "ACTIVE" },
      });
    }
    if (!section) {
      section = await prisma.section.findFirst();
    }
    if (!section) {
      let grade = await prisma.grade.findFirst({ where: { tenantId } });
      if (!grade) {
        grade = await prisma.grade.findFirst();
      }

      let academicYear = await prisma.academicYear.findFirst({
        where: { tenantId, status: "ACTIVE" },
      });
      if (!academicYear) {
        academicYear = await prisma.academicYear.findFirst({
          where: { tenantId },
        });
      }
      if (!academicYear) {
        academicYear = await prisma.academicYear.findFirst();
      }

      if (grade && academicYear) {
        section = await prisma.section.create({
          data: {
            tenantId,
            academicYearId: academicYear.id,
            gradeId: grade.id,
            name: "Default Section",
            code: `SEC-DEF-${Date.now().toString(36).toUpperCase()}`,
            capacity: 50,
            status: "ACTIVE",
          },
        });
      }
    }

    if (section) {
      const created = await prisma.assessmentAssignment.create({
        data: {
          assessmentId,
          sectionId: section.id,
          createdById: userId,
          status: "PUBLISHED",
        },
      });
      return created.id;
    }

    throw new Error("Unable to initialize assessment assignment for this session.");
  }

  async findAssessmentForAttempt(tenantId: string, assessmentId: string) {
    return prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        tenantId,
      },
      include: {
        assignments: {
          where: {
            status: { in: ["PUBLISHED", "ACTIVE"] },
          },
          include: {
            section: true,
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
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });
  }

  async findActiveAttemptByAssessment(
    assessmentId: string,
    studentId: string
  ) {
    return prisma.assessmentAttempt.findFirst({
      where: {
        assessmentId,
        studentId,
        status: "IN_PROGRESS",
      },
      include: {
        answers: true,
        assessment: {
          include: {
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
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
      },
    });
  }

  async verifyStudentEnrollment(
    studentId: string,
    sectionId: string
  ): Promise<boolean> {
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        sectionId,
        status: "ACTIVE",
      },
    });
    return !!enrollment;
  }

  async countStudentAttempts(
    assignmentId: string,
    studentId: string
  ): Promise<number> {
    return prisma.assessmentAttempt.count({
      where: {
        assignmentId,
        studentId,
      },
    });
  }

  async findActiveAttempt(
    assignmentId: string,
    studentId: string
  ) {
    return prisma.assessmentAttempt.findFirst({
      where: {
        assignmentId,
        studentId,
        status: "IN_PROGRESS",
      },
      include: {
        answers: true,
        assessment: {
          include: {
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
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
      },
    });
  }

  async createAttempt(
    assessmentId: string,
    assignmentId: string,
    studentId: string,
    attemptNumber: number
  ) {
    return prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        assignmentId,
        studentId,
        attemptNumber,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      include: {
        answers: true,
        assessment: {
          include: {
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
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
      },
    });
  }

  async findAttemptById(
    id: string
  ) {
    return prisma.assessmentAttempt.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            questionVersion: {
              include: {
                options: {
                  orderBy: { orderIndex: "asc" },
                },
                question: true,
              },
            },
          },
        },
        assessment: {
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
          },
        },
        assignment: {
          include: {
            section: {
              include: {
                grade: true,
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

  async saveStudentAnswer(
    attemptId: string,
    questionVersionId: string,
    response: unknown
  ): Promise<StudentAnswer> {
    return prisma.studentAnswer.upsert({
      where: {
        attemptId_questionVersionId: {
          attemptId,
          questionVersionId,
        },
      },
      create: {
        attemptId,
        questionVersionId,
        answer: response as Prisma.InputJsonValue,
        status: response !== null && response !== undefined ? "ANSWERED" : "UNANSWERED",
      },
      update: {
        answer: response as Prisma.InputJsonValue,
        status: response !== null && response !== undefined ? "ANSWERED" : "UNANSWERED",
      },
    });
  }

  async batchSaveStudentAnswers(
    attemptId: string,
    answers: Array<{ questionVersionId: string; response: unknown }>
  ): Promise<void> {
    await prisma.$transaction(
      answers.map((a) =>
        prisma.studentAnswer.upsert({
          where: {
            attemptId_questionVersionId: {
              attemptId,
              questionVersionId: a.questionVersionId,
            },
          },
          create: {
            attemptId,
            questionVersionId: a.questionVersionId,
            answer: a.response as Prisma.InputJsonValue,
            status: a.response !== null && a.response !== undefined ? "ANSWERED" : "UNANSWERED",
          },
          update: {
            answer: a.response as Prisma.InputJsonValue,
            status: a.response !== null && a.response !== undefined ? "ANSWERED" : "UNANSWERED",
          },
        })
      )
    );
  }

  async finalizeAttempt(
    attemptId: string,
    data: {
      status: AttemptStatus;
      submittedAt: Date;
      gradedAt?: Date | null;
      score: number;
      maxScore: number;
      percentage: number;
      answers: Array<{
        questionVersionId: string;
        response: unknown;
        isCorrect: boolean | null;
        awardedPoints: number;
        maxPoints: number;
        status: AnswerStatus;
      }>;
    }
  ): Promise<AssessmentAttempt> {
    return prisma.$transaction(async (tx) => {
      for (const ans of data.answers) {
        await tx.studentAnswer.upsert({
          where: {
            attemptId_questionVersionId: {
              attemptId,
              questionVersionId: ans.questionVersionId,
            },
          },
          create: {
            attemptId,
            questionVersionId: ans.questionVersionId,
            answer: ans.response as Prisma.InputJsonValue,
            isCorrect: ans.isCorrect,
            awardedPoints: new Prisma.Decimal(ans.awardedPoints),
            maxPoints: new Prisma.Decimal(ans.maxPoints),
            status: ans.status,
          },
          update: {
            answer: ans.response as Prisma.InputJsonValue,
            isCorrect: ans.isCorrect,
            awardedPoints: new Prisma.Decimal(ans.awardedPoints),
            maxPoints: new Prisma.Decimal(ans.maxPoints),
            status: ans.status,
          },
        });
      }

      return tx.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: data.status,
          submittedAt: data.submittedAt,
          gradedAt: data.gradedAt ?? (data.status === "GRADED" ? new Date() : null),
          score: new Prisma.Decimal(data.score),
          maxScore: new Prisma.Decimal(data.maxScore),
          percentage: new Prisma.Decimal(data.percentage),
        },
        include: {
          answers: {
            include: {
              questionVersion: {
                include: {
                  options: {
                    orderBy: { orderIndex: "asc" },
                  },
                  question: true,
                },
              },
            },
          },
          assessment: {
            include: {
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
        },
      });
    });
  }

  async applyManualGrading(
    attemptId: string,
    gradedById: string,
    dto: ManualGradeAttemptDto
  ): Promise<AssessmentAttempt> {
    return prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.findUniqueOrThrow({
        where: { id: attemptId },
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

      return tx.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: finalStatus,
          score: new Prisma.Decimal(totalAwarded),
          maxScore: new Prisma.Decimal(totalMax),
          percentage: new Prisma.Decimal(percentage),
          gradedAt: finalStatus === "GRADED" ? new Date() : attempt.gradedAt,
        },
        include: {
          answers: true,
          assessment: true,
        },
      });
    });
  }

  async listAttempts(
    tenantId: string,
    assessmentId: string,
    filters: AttemptQueryFilters
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentAttemptWhereInput = {
      assessmentId,
      assessment: { tenantId },
      student: {
        tenantId,
        user: {
          teacherProfile: null,
        },
      },
      ...(filters.studentId && { studentId: filters.studentId }),
      ...(filters.assignmentId && { assignmentId: filters.assignmentId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.sectionId && {
        assignment: { sectionId: filters.sectionId },
      }),
    };

    const sortBy = filters.sortBy ?? "startedAt";
    const sortOrder = filters.sortOrder ?? "desc";

    const [total, items] = await Promise.all([
      prisma.assessmentAttempt.count({ where }),
      prisma.assessmentAttempt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
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
          assignment: {
            include: {
              section: true,
            },
          },
          _count: {
            select: {
              answers: true,
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

  async listStudentInProgressAttempts(
    tenantId: string,
    studentId: string,
    limit: number = 6
  ) {
    return prisma.assessmentAttempt.findMany({
      where: {
        assessment: { tenantId },
        studentId,
        status: "IN_PROGRESS",
      },
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
        _count: {
          select: {
            answers: {
              where: {
                status: "ANSWERED",
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: limit,
    });
  }
}
