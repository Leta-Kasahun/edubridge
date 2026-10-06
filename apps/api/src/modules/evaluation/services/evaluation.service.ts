import { EvaluationRepository } from "../repository/evaluation.repository.js";
import { MasteryService } from "../../mastery/services/mastery.service.js";
import { domainEventBus } from "../../../shared/events/domain-events.js";
import { prisma } from "../../../lib/prisma.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../../../shared/exceptions/index.js";
import {
  ManualGradeAttemptDto,
  SubmitQuestionFeedbackInput,
  StudentResultsResponse,
} from "../types/evaluation.types.js";

function parseAttemptFeedback(gradingVersion: string | null): string | null {
  if (!gradingVersion) return null;
  try {
    const parsed = JSON.parse(gradingVersion);
    if (typeof parsed === "object" && parsed !== null) {
      return (parsed.generalFeedback as string) || (parsed.feedback as string) || null;
    }
    return gradingVersion;
  } catch {
    return gradingVersion;
  }
}

export class EvaluationService {
  constructor(
    private readonly evaluationRepo = new EvaluationRepository(),
    private readonly masteryService = new MasteryService()
  ) {}

  async getAttemptResult(
    tenantId: string,
    userId: string,
    userRoles: string[],
    assessmentId: string,
    attemptId: string
  ) {
    if (attemptId.startsWith("preview-")) {
      const assessment = await this.evaluationRepo.findAssessmentForAttempt(tenantId, assessmentId);
      if (!assessment) {
        throw new NotFoundError("Assessment not found");
      }
      return {
        id: attemptId,
        assessmentId,
        assignmentId: assessment.assignments?.[0]?.id || assessment.id,
        attemptNumber: 1,
        status: "GRADED",
        startedAt: new Date(),
        submittedAt: new Date(),
        gradedAt: new Date(),
        score: 0,
        maxScore: 100,
        percentage: 0,
        answers: [],
        assessment,
        isStaffPreview: true,
      };
    }

    const attempt = await this.evaluationRepo.findAttemptResult(tenantId, assessmentId, attemptId);
    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    const isTeacherOrSchoolAdmin = userRoles.some((role) =>
      ["TEACHER", "SCHOOL_ADMIN"].includes(role)
    );

    if (!isTeacherOrSchoolAdmin) {
      const student = await this.evaluationRepo.findStudentProfileByUserId(tenantId, userId);
      if (!student || attempt.studentId !== student.id) {
        throw new ForbiddenError("You are not authorized to view this attempt result");
      }

      if (!attempt.assessment.showResults && attempt.status !== "GRADED") {
        return {
          id: attempt.id,
          assessmentId: attempt.assessmentId,
          attemptNumber: attempt.attemptNumber,
          status: attempt.status,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          message: "Results are hidden by the instructor until grading is finalized.",
        };
      }
    }

    const generalFeedback = parseAttemptFeedback(attempt.gradingVersion);

    return {
      ...attempt,
      generalFeedback,
    };
  }

  async manualGrade(
    tenantId: string,
    teacherUserId: string,
    assessmentId: string,
    attemptId: string,
    dto: ManualGradeAttemptDto
  ) {
    const attempt = await this.evaluationRepo.findAttemptById(tenantId, attemptId);
    if (!attempt || attempt.assessmentId !== assessmentId) {
      throw new NotFoundError("Attempt not found");
    }

    const graded = await this.evaluationRepo.applyManualGrading(tenantId, attemptId, teacherUserId, dto);
    if (graded.status === "GRADED") {
      try {
        await this.masteryService.recordEvidenceForAttempt(attemptId, tenantId);
      } catch {
        // Evidence recording is non-blocking
      }

      const studentUserId = attempt.student?.user?.id ?? null;
      if (studentUserId) {
        const teacherProfile = await prisma.teacherProfile.findFirst({
          where: { userId: teacherUserId, tenantId },
          select: { firstName: true, lastName: true },
        });
        const hasFeedback = Boolean(
          dto.generalFeedback?.trim() ||
          dto.grades.some((g) => g.feedback && g.feedback.trim())
        );

        domainEventBus.emitEvent("assessment.graded", {
          tenantId,
          assessmentId,
          assessmentTitle: attempt.assessment.title,
          attemptId,
          studentUserId,
          teacherName: teacherProfile ? `${teacherProfile.firstName} ${teacherProfile.lastName}` : null,
          percentage: Math.round(Number(graded.percentage ?? 0)),
          isManual: true,
          hasFeedback,
          feedbackSnippet: dto.generalFeedback?.trim() || null,
        });
      }
    }
    return graded;
  }

  async listStudentResults(
    tenantId: string,
    userId: string,
    filters: { page?: number; limit?: number } = {}
  ): Promise<StudentResultsResponse> {
    const student = await this.evaluationRepo.findStudentProfileByUserId(tenantId, userId);
    if (!student) {
      return { items: [], total: 0, page: 1, limit: filters.limit ?? 20, totalPages: 0 };
    }

    const res = await this.evaluationRepo.listStudentResults(tenantId, student.id, filters);

    const items = res.items.map((a) => {
      const generalFeedback = parseAttemptFeedback(a.gradingVersion);
      const hasQuestionFeedback = a.answers.some((ans) => Boolean(ans.feedback?.trim()));
      const hasTeacherFeedback = Boolean(generalFeedback || hasQuestionFeedback);

      return {
        id: a.id,
        assessmentId: a.assessment.id,
        title: a.assessment.title,
        type: a.assessment.type,
        timeLimitMinutes: a.assessment.timeLimitMinutes,
        subjectCode: a.assessment.examContext?.code || "EXAM",
        subjectName: a.assessment.examContext?.name || a.assessment.title,
        submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
        gradedAt: a.gradedAt ? a.gradedAt.toISOString() : null,
        status: a.status,
        score: a.score ? Number(a.score) : 0,
        maxScore: a.maxScore ? Number(a.maxScore) : 100,
        percentage: a.percentage ? Number(a.percentage) : 0,
        hasTeacherFeedback,
        generalFeedback,
        feedbackCount: a.answers.filter((ans) => Boolean(ans.feedback?.trim())).length + (generalFeedback ? 1 : 0),
      };
    });

    return {
      items,
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
  }

  async submitQuestionFeedback(
    tenantId: string,
    userId: string,
    assessmentId: string,
    dto: SubmitQuestionFeedbackInput
  ) {
    const assessment = await this.evaluationRepo.findAssessmentForAttempt(tenantId, assessmentId);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    const studentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });
    const studentName = studentUser
      ? `${studentUser.firstName || ""} ${studentUser.lastName || ""}`.trim() || "Student"
      : "Student";

    const questionVersion = await prisma.questionVersion.findUnique({
      where: { id: dto.questionVersionId },
      include: {
        question: {
          include: {
            questionBank: true,
            createdBy: true,
          },
        },
      },
    });

    const currentConfig =
      typeof questionVersion?.configuration === "object" && questionVersion.configuration !== null
        ? { ...(questionVersion.configuration as Record<string, unknown>) }
        : {};

    const rawReports = Array.isArray(currentConfig.reports) ? [...currentConfig.reports] : [];

    const newReport = {
      id: crypto.randomUUID(),
      studentId: userId,
      studentName,
      reason: dto.category.replace(/_/g, " "),
      comment: dto.message,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      assessmentId,
      assessmentTitle: assessment.title,
    };

    rawReports.push(newReport);
    currentConfig.reports = rawReports;

    if (questionVersion) {
      await prisma.questionVersion.update({
        where: { id: questionVersion.id },
        data: {
          configuration: JSON.parse(JSON.stringify(currentConfig)),
        },
      });
    }

    const bankId = questionVersion?.question?.questionBankId || "";
    const bankTitle = questionVersion?.question?.questionBank?.name || assessment.title || "Assessment";
    const authorUserId = assessment.createdById || questionVersion?.question?.createdBy?.id || "";

    domainEventBus.emitEvent("question.report_submitted", {
      tenantId,
      questionId: questionVersion?.questionId || dto.questionVersionId,
      bankId,
      bankTitle,
      studentUserId: userId,
      studentName,
      authorUserId,
      reason: dto.category.replace(/_/g, " "),
      comment: dto.message,
    });

    return { success: true, message: "Feedback submitted successfully" };
  }
}
