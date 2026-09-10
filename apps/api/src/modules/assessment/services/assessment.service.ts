import { AssessmentRepository } from "../repository/assessment.repository.js";
import {
  CreateAssessmentDto,
  UpdateAssessmentDto,
  AssessmentQueryFilters,
  AssessmentQuestionInput,
  AssignAssessmentDto,
} from "../types/assessment.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";
import { BadRequestError } from "../../../shared/exceptions/bad-request-error.js";
import { prisma } from "../../../lib/prisma.js";

export class AssessmentService {
  constructor(private readonly assessmentRepo: AssessmentRepository = new AssessmentRepository()) {}

  async create(tenantId: string, createdById: string, dto: CreateAssessmentDto) {
    if (dto.availableFrom && dto.availableUntil) {
      const from = new Date(dto.availableFrom).getTime();
      const until = new Date(dto.availableUntil).getTime();
      if (from > until) {
        throw new BadRequestError("availableFrom cannot be later than availableUntil");
      }
    }

    return this.assessmentRepo.create(tenantId, createdById, dto);
  }

  async getById(tenantId: string, id: string) {
    const assessment = await this.assessmentRepo.findById(tenantId, id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }
    return assessment;
  }

  async list(tenantId: string, filters: AssessmentQueryFilters) {
    return this.assessmentRepo.list(tenantId, filters);
  }

  async update(tenantId: string, id: string, dto: UpdateAssessmentDto) {
    const existing = await this.assessmentRepo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Assessment not found");
    }

    if (existing.status === "ARCHIVED" && dto.status !== "DRAFT" && dto.status !== "ACTIVE") {
      throw new BadRequestError("Cannot modify an archived assessment");
    }

    if (dto.availableFrom || dto.availableUntil) {
      const from = new Date(dto.availableFrom ?? existing.availableFrom ?? "").getTime();
      const until = new Date(dto.availableUntil ?? existing.availableUntil ?? "").getTime();
      if (!Number.isNaN(from) && !Number.isNaN(until) && from > until) {
        throw new BadRequestError("availableFrom cannot be later than availableUntil");
      }
    }

    return this.assessmentRepo.update(tenantId, id, dto);
  }

  async setQuestions(
    tenantId: string,
    id: string,
    questions: AssessmentQuestionInput[]
  ) {
    const assessment = await this.assessmentRepo.findById(tenantId, id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    const attemptsCount = await prisma.assessmentAttempt.count({
      where: { assessmentId: id },
    });

    if (attemptsCount > 0) {
      throw new BadRequestError(
        "Cannot alter questions on an assessment that already has student attempts"
      );
    }

    await this.assessmentRepo.setQuestions(tenantId, id, questions);
    return this.assessmentRepo.findById(tenantId, id);
  }

  async assignToSections(
    tenantId: string,
    id: string,
    createdById: string,
    dto: AssignAssessmentDto
  ) {
    const assessment = await this.assessmentRepo.findById(tenantId, id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    if (assessment.status === "DRAFT") {
      await this.assessmentRepo.update(tenantId, id, { status: "PUBLISHED" });
    }

    return this.assessmentRepo.assignToSections(tenantId, id, createdById, dto);
  }

  async publish(tenantId: string, id: string) {
    const assessment = await this.assessmentRepo.findById(tenantId, id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    const questionsCount = await prisma.assessmentQuestion.count({
      where: { assessmentId: id },
    });

    if (questionsCount === 0) {
      throw new BadRequestError(
        "Cannot publish an assessment with no questions attached"
      );
    }

    return this.assessmentRepo.update(tenantId, id, { status: "PUBLISHED" });
  }

  async archive(tenantId: string, id: string) {
    const assessment = await this.assessmentRepo.findById(tenantId, id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }
    return this.assessmentRepo.archive(tenantId, id);
  }
}
