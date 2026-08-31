import { gradeRepository, GradeRepository } from "../repository/grade.repository.js";
import {
  GradeRecord,
  GradeDetailRecord,
  CreateGradeInput,
  GradeFilterParams,
} from "../types/grade.types.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";

export class GradeService {
  constructor(private readonly repo: GradeRepository = gradeRepository) {}

  async getGrades(
    tenantId: string,
    filters: Omit<GradeFilterParams, "tenantId"> = {}
  ): Promise<readonly GradeRecord[]> {
    return this.repo.findMany({
      ...filters,
      tenantId,
    });
  }

  async getGradeById(
    tenantId: string,
    id: string,
    academicYearId?: string
  ): Promise<GradeDetailRecord> {
    const grade = await this.repo.findById(tenantId, id, academicYearId);
    if (!grade) {
      throw new NotFoundError("Grade not found");
    }
    return grade;
  }

  async createGrade(
    tenantId: string,
    input: CreateGradeInput
  ): Promise<GradeRecord> {
    const existing = await this.repo.findByLevel(tenantId, input.level);
    if (existing) {
      throw new ConflictError(`Grade level ${input.level} already exists in this school`);
    }

    return this.repo.create(tenantId, input);
  }

  async toggleActiveStatus(
    tenantId: string,
    id: string
  ): Promise<GradeRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Grade not found");
    }

    if (existing.isActive && existing.studentCount > 0) {
      throw new BadRequestError(
        `Cannot deactivate Grade ${existing.level} because ${existing.studentCount} students are actively enrolled`
      );
    }

    return this.repo.toggleActive(tenantId, id);
  }
}

export const gradeService = new GradeService();
