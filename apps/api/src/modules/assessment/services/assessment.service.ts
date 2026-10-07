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
import { domainEventBus } from "../../../shared/events/domain-events.js";

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

    if (dto.topicId && (!dto.unitId || !dto.subjectId || !dto.gradeId)) {
      const topic = await prisma.curriculumTopic.findUnique({
        where: { id: dto.topicId },
        include: {
          unit: {
            include: {
              curriculumSubject: true,
            },
          },
        },
      });
      if (topic) {
        if (!dto.unitId) dto.unitId = topic.unitId;
        if (!dto.subjectId) dto.subjectId = topic.unit.curriculumSubject.subjectId;
        if (!dto.gradeId) dto.gradeId = topic.unit.curriculumSubject.gradeId;
        if (!dto.curriculumVersionId) dto.curriculumVersionId = topic.unit.curriculumSubject.curriculumVersionId;
      }
    } else if (dto.unitId && (!dto.subjectId || !dto.gradeId)) {
      const unit = await prisma.curriculumUnit.findUnique({
        where: { id: dto.unitId },
        include: {
          curriculumSubject: true,
        },
      });
      if (unit) {
        if (!dto.subjectId) dto.subjectId = unit.curriculumSubject.subjectId;
        if (!dto.gradeId) dto.gradeId = unit.curriculumSubject.gradeId;
        if (!dto.curriculumVersionId) dto.curriculumVersionId = unit.curriculumSubject.curriculumVersionId;
      }
    } else if (dto.examContextId && (!dto.subjectId || !dto.gradeId)) {
      const ctx = await prisma.examContext.findUnique({
        where: { id: dto.examContextId },
      });
      if (ctx) {
        if (!dto.subjectId && ctx.subjectId) dto.subjectId = ctx.subjectId;
        if (!dto.gradeId && ctx.gradeId) dto.gradeId = ctx.gradeId;
        if (!dto.curriculumVersionId && ctx.curriculumVersionId) dto.curriculumVersionId = ctx.curriculumVersionId;
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

    const resolvedFrom = dto.availableFrom !== undefined ? dto.availableFrom : existing.availableFrom;
    const resolvedUntil = dto.availableUntil !== undefined ? dto.availableUntil : existing.availableUntil;

    if (resolvedFrom && resolvedUntil) {
      const from = new Date(resolvedFrom).getTime();
      const until = new Date(resolvedUntil).getTime();
      if (!Number.isNaN(from) && !Number.isNaN(until) && from > until) {
        throw new BadRequestError("availableFrom cannot be later than availableUntil");
      }
    }

    if (dto.topicId && (!dto.unitId || !dto.subjectId || !dto.gradeId)) {
      const topic = await prisma.curriculumTopic.findUnique({
        where: { id: dto.topicId },
        include: {
          unit: {
            include: {
              curriculumSubject: true,
            },
          },
        },
      });
      if (topic) {
        if (!dto.unitId) dto.unitId = topic.unitId;
        if (!dto.subjectId) dto.subjectId = topic.unit.curriculumSubject.subjectId;
        if (!dto.gradeId) dto.gradeId = topic.unit.curriculumSubject.gradeId;
        if (!dto.curriculumVersionId) dto.curriculumVersionId = topic.unit.curriculumSubject.curriculumVersionId;
      }
    } else if (dto.unitId && (!dto.subjectId || !dto.gradeId)) {
      const unit = await prisma.curriculumUnit.findUnique({
        where: { id: dto.unitId },
        include: {
          curriculumSubject: true,
        },
      });
      if (unit) {
        if (!dto.subjectId) dto.subjectId = unit.curriculumSubject.subjectId;
        if (!dto.gradeId) dto.gradeId = unit.curriculumSubject.gradeId;
        if (!dto.curriculumVersionId) dto.curriculumVersionId = unit.curriculumSubject.curriculumVersionId;
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

    const result = await this.assessmentRepo.assignToSections(tenantId, id, createdById, dto);

    domainEventBus.emitEvent("assessment.assigned", {
      tenantId,
      assessmentId: id,
      assessmentTitle: assessment.title,
      sectionIds: dto.sectionIds,
      availableUntil: assessment.availableUntil ? assessment.availableUntil.toISOString() : null,
    });

    return result;
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
