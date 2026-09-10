import { AttemptRepository } from "../repository/attempt.repository.js";
import { AssessmentRepository } from "../repository/assessment.repository.js";
import { GradingEngine, QuestionVersionForGrading } from "../../grading/grading.engine.js";
import {
  SaveAnswerDto,
  BatchSaveAnswersDto,
  SubmitAttemptPayload,
  ManualGradeAttemptDto,
  AttemptQueryFilters,
  StudentActiveAttemptSession,
  StudentQuestionView,
} from "../types/assessment.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";
import { BadRequestError } from "../../../shared/exceptions/bad-request-error.js";
import { ForbiddenError } from "../../../shared/exceptions/forbidden-error.js";
import {
  calculatePercentage,
  getAttemptDeadline,
  isAttemptExpired,
} from "../../../shared/utils/grading.util.js";
import type {
  AttemptStatus,
  AnswerStatus,
} from "../../../generated/prisma/enums.js";

export class AttemptService {
  constructor(
    private readonly attemptRepo: AttemptRepository = new AttemptRepository(),
    private readonly assessmentRepo: AssessmentRepository = new AssessmentRepository()
  ) {}

  async startAttempt(
    tenantId: string,
    userId: string,
    userRoles: string[],
    assessmentId: string,
    assignmentId?: string
  ): Promise<StudentActiveAttemptSession> {
    const isStaff = userRoles.some((role) =>
      ["TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"].includes(role)
    );

    const assessment = await this.attemptRepo.findAssessmentForAttempt(tenantId, assessmentId);
    if (!assessment) {
      throw new NotFoundError("Assessment not found or not accessible");
    }

    if (!isStaff && (assessment.status === "ARCHIVED" || assessment.status === "DRAFT")) {
      throw new BadRequestError(`Cannot start an assessment with status: ${assessment.status}`);
    }

    const now = new Date();
    if (!isStaff && assessment.availableFrom && now < new Date(assessment.availableFrom)) {
      throw new BadRequestError("This assessment is not yet available");
    }
    if (!isStaff && assessment.availableUntil && now > new Date(assessment.availableUntil)) {
      throw new BadRequestError("This assessment is no longer available");
    }

    const student = await this.attemptRepo.ensureStudentProfileForUser(tenantId, userId);

    const effectiveAssignmentId = await this.attemptRepo.ensureAssignmentForAssessment(
      tenantId,
      userId,
      assessment.id,
      assignmentId
    );

    const existingActive = await this.attemptRepo.findActiveAttemptByAssessment(
      assessment.id,
      student.id
    );

    if (existingActive) {
      const isExpired = isAttemptExpired(
        existingActive.startedAt,
        assessment.timeLimitMinutes
      );

      if (isExpired && !isStaff) {
        await this.submitAttempt(tenantId, userId, assessment.id, existingActive.id, {});
      } else {
        return this.buildStudentActiveSession(existingActive, assessment);
      }
    }

    const existingAttemptsCount = await this.attemptRepo.countStudentAttempts(
      effectiveAssignmentId,
      student.id
    );

    const newAttemptNumber = existingAttemptsCount + 1;
    const newAttempt = await this.attemptRepo.createAttempt(
      assessment.id,
      effectiveAssignmentId,
      student.id,
      newAttemptNumber
    );

    return this.buildStudentActiveSession(newAttempt, assessment);
  }

  async saveAnswer(
    tenantId: string,
    userId: string,
    assessmentId: string,
    attemptId: string,
    dto: SaveAnswerDto
  ) {
    const student = await this.attemptRepo.findStudentProfileByUserId(tenantId, userId);
    if (!student) {
      throw new ForbiddenError("Student profile not found");
    }

    const attempt = await this.attemptRepo.findAttemptById(attemptId);
    if (!attempt || attempt.assessmentId !== assessmentId || attempt.studentId !== student.id) {
      throw new NotFoundError("Active attempt not found");
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError("Cannot save answers to an attempt that is not in progress");
    }

    const isExpired = isAttemptExpired(
      attempt.startedAt,
      attempt.assessment.timeLimitMinutes
    );
    if (isExpired) {
      await this.submitAttempt(tenantId, userId, assessmentId, attemptId, {});
      throw new BadRequestError("Time limit has expired for this attempt");
    }

    return this.attemptRepo.saveStudentAnswer(
      attemptId,
      dto.questionVersionId,
      dto.response
    );
  }

  async batchSaveAnswers(
    tenantId: string,
    userId: string,
    assessmentId: string,
    attemptId: string,
    dto: BatchSaveAnswersDto
  ) {
    const student = await this.attemptRepo.findStudentProfileByUserId(tenantId, userId);
    if (!student) {
      throw new ForbiddenError("Student profile not found");
    }

    const attempt = await this.attemptRepo.findAttemptById(attemptId);
    if (!attempt || attempt.assessmentId !== assessmentId || attempt.studentId !== student.id) {
      throw new NotFoundError("Active attempt not found");
    }

    if (attempt.status !== "IN_PROGRESS") {
      throw new BadRequestError("Cannot save answers to an attempt that is not in progress");
    }

    const isExpired = isAttemptExpired(
      attempt.startedAt,
      attempt.assessment.timeLimitMinutes
    );
    if (isExpired) {
      await this.submitAttempt(tenantId, userId, assessmentId, attemptId, {});
      throw new BadRequestError("Time limit has expired for this attempt");
    }

    await this.attemptRepo.batchSaveStudentAnswers(attemptId, dto.answers);
    return { success: true, count: dto.answers.length };
  }

  async submitAttempt(
    tenantId: string,
    userId: string,
    assessmentId: string,
    attemptId: string,
    dto: SubmitAttemptPayload
  ) {
    const student = await this.attemptRepo.findStudentProfileByUserId(tenantId, userId);
    const attempt = await this.attemptRepo.findAttemptById(attemptId);

    if (!attempt || attempt.assessmentId !== assessmentId) {
      throw new NotFoundError("Attempt not found");
    }

    if (student && attempt.studentId !== student.id) {
      throw new ForbiddenError("You cannot submit an attempt that belongs to another student");
    }

    if (attempt.status !== "IN_PROGRESS") {
      return attempt;
    }

    if (dto.answers && dto.answers.length > 0) {
      await this.attemptRepo.batchSaveStudentAnswers(attemptId, dto.answers);
    }

    const refreshedAttempt = await this.attemptRepo.findAttemptById(attemptId);
    if (!refreshedAttempt) {
      throw new NotFoundError("Attempt not found");
    }

    const questions = refreshedAttempt.assessment.questions;
    const existingAnswers = refreshedAttempt.answers;

    let totalAwarded = 0;
    let totalMax = 0;
    let requiresManualGrading = false;

    const gradedAnswers: Array<{
      questionVersionId: string;
      response: unknown;
      isCorrect: boolean | null;
      awardedPoints: number;
      maxPoints: number;
      status: AnswerStatus;
    }> = [];

    for (const q of questions) {
      const qv = q.questionVersion;
      const qPoints = Number(q.points) || 0;
      totalMax += qPoints;

      const savedAnswer = existingAnswers.find(
        (ans: { questionVersionId: string; answer?: unknown }) =>
          ans.questionVersionId === q.questionVersionId
      );
      const studentResponse = savedAnswer ? savedAnswer.answer : null;

      const qvForGrading: QuestionVersionForGrading = {
        id: qv.id,
        type: qv.type,
        points: qPoints,
        configuration: qv.configuration,
        options: qv.options,
      };

      const result = GradingEngine.gradeResponse(qvForGrading, studentResponse);

      if (result.gradingStatus === "MANUAL_GRADING") {
        requiresManualGrading = true;
        gradedAnswers.push({
          questionVersionId: q.questionVersionId,
          response: studentResponse,
          isCorrect: null,
          awardedPoints: 0,
          maxPoints: qPoints,
          status: studentResponse !== null && studentResponse !== undefined ? "ANSWERED" : "UNANSWERED",
        });
      } else {
        const points = result.awardedPoints;
        totalAwarded += points;
        gradedAnswers.push({
          questionVersionId: q.questionVersionId,
          response: studentResponse,
          isCorrect: result.isCorrect,
          awardedPoints: points,
          maxPoints: qPoints,
          status: "GRADED",
        });
      }
    }

    const percentage = calculatePercentage(totalAwarded, totalMax);
    const finalStatus: AttemptStatus = requiresManualGrading ? "GRADING" : "GRADED";

    return this.attemptRepo.finalizeAttempt(attemptId, {
      status: finalStatus,
      submittedAt: new Date(),
      gradedAt: finalStatus === "GRADED" ? new Date() : null,
      score: totalAwarded,
      maxScore: totalMax,
      percentage,
      answers: gradedAnswers,
    });
  }

  async getAttemptResult(
    tenantId: string,
    userId: string,
    userRoles: string[],
    assessmentId: string,
    attemptId: string
  ) {
    const attempt = await this.attemptRepo.findAttemptById(attemptId);
    if (!attempt || attempt.assessmentId !== assessmentId) {
      throw new NotFoundError("Attempt not found");
    }

    const isTeacherOrSchoolAdmin = userRoles.some((role) =>
      ["TEACHER", "SCHOOL_ADMIN"].includes(role)
    );

    if (!isTeacherOrSchoolAdmin) {
      const student = await this.attemptRepo.findStudentProfileByUserId(tenantId, userId);
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

    return attempt;
  }

  async manualGrade(
    tenantId: string,
    teacherUserId: string,
    assessmentId: string,
    attemptId: string,
    dto: ManualGradeAttemptDto
  ) {
    const attempt = await this.attemptRepo.findAttemptById(attemptId);
    if (!attempt || attempt.assessmentId !== assessmentId) {
      throw new NotFoundError("Attempt not found");
    }

    return this.attemptRepo.applyManualGrading(attemptId, teacherUserId, dto);
  }

  async listAttempts(
    tenantId: string,
    assessmentId: string,
    filters: AttemptQueryFilters
  ) {
    return this.attemptRepo.listAttempts(tenantId, assessmentId, filters);
  }

  private buildStudentActiveSession(
    attempt: {
      id: string;
      assessmentId: string;
      assignmentId: string;
      attemptNumber: number;
      status: AttemptStatus;
      startedAt: Date;
      answers?: Array<{ questionVersionId: string; answer: unknown }>;
    },
    assessment: {
      id: string;
      timeLimitMinutes: number | null;
      randomizeQuestions: boolean;
      randomizeOptions: boolean;
      questions: Array<{
        questionVersionId: string;
        orderIndex: number;
        points: unknown;
        questionVersion: {
          id: string;
          questionId: string;
          type: string;
          difficulty: string;
          questionText: string;
          configuration?: unknown;
          options: Array<{
            id: string;
            optionKey: string;
            optionText: string;
            orderIndex: number;
          }>;
        };
      }>;
    }
  ): StudentActiveAttemptSession {
    const deadline = getAttemptDeadline(
      attempt.startedAt,
      assessment.timeLimitMinutes
    );

    let questionsList = [...assessment.questions];
    if (assessment.randomizeQuestions) {
      questionsList = questionsList.sort(() => Math.random() - 0.5);
    }

    let totalPoints = 0;
    const questionsView: StudentQuestionView[] = questionsList.map((q, idx) => {
      const qv = q.questionVersion;
      const points =
        typeof q.points === "number"
          ? q.points
          : typeof q.points === "object" && q.points !== null && "toNumber" in q.points && typeof (q.points as { toNumber: () => number }).toNumber === "function"
          ? (q.points as { toNumber: () => number }).toNumber()
          : Number(q.points) || 0;

      totalPoints += points;

      let options = (qv.options || []).map((opt) => ({
        id: opt.id,
        optionKey: opt.optionKey,
        optionText: opt.optionText,
        orderIndex: opt.orderIndex,
      }));

      if (assessment.randomizeOptions) {
        options = options.sort(() => Math.random() - 0.5);
      }

      const savedAnswer = attempt.answers?.find(
        (ans) => ans.questionVersionId === q.questionVersionId
      );

      return {
        questionVersionId: q.questionVersionId,
        questionId: qv.questionId,
        orderIndex: idx + 1,
        points,
        type: qv.type as unknown as StudentQuestionView["type"],
        difficulty: qv.difficulty as unknown as StudentQuestionView["difficulty"],
        questionText: qv.questionText,
        configuration: qv.configuration,
        options,
        savedAnswer: savedAnswer ? savedAnswer.answer : undefined,
      };
    });

    return {
      attemptId: attempt.id,
      assessmentId: attempt.assessmentId,
      assignmentId: attempt.assignmentId,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      deadline: deadline ? deadline.toISOString() : null,
      timeLimitMinutes: assessment.timeLimitMinutes,
      totalQuestions: questionsView.length,
      totalPoints,
      questions: questionsView,
    };
  }
}
