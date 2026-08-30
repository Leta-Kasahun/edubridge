import {
  academicYearRepository,
  AcademicYearRepository,
} from "../repository/academic-year.repository.js";
import {
  AcademicYearRecord,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  AcademicYearFilterParams,
  PaginatedAcademicYearsResult,
} from "../types/academic-year.types.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";

export class AcademicYearService {
  constructor(
    private readonly repo: AcademicYearRepository = academicYearRepository
  ) {}

  async getAcademicYears(
    tenantId: string,
    filters: Omit<AcademicYearFilterParams, "tenantId"> = {}
  ): Promise<PaginatedAcademicYearsResult> {
    return this.repo.findMany({
      ...filters,
      tenantId,
    });
  }

  async getAcademicYearById(
    tenantId: string,
    id: string
  ): Promise<AcademicYearRecord> {
    const year = await this.repo.findById(tenantId, id);
    if (!year) {
      throw new NotFoundError("Academic year not found");
    }
    return year;
  }

  async getActiveAcademicYear(tenantId: string): Promise<AcademicYearRecord | null> {
    return this.repo.findActive(tenantId);
  }

  async createAcademicYear(
    tenantId: string,
    input: CreateAcademicYearInput
  ): Promise<AcademicYearRecord> {
    const existing = await this.repo.findByCode(tenantId, input.code);
    if (existing) {
      throw new ConflictError(
        `Academic year with code "${input.code}" already exists in this school`
      );
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      throw new BadRequestError("End date must be chronologically after start date");
    }

    return this.repo.create(tenantId, input);
  }

  async updateAcademicYear(
    tenantId: string,
    id: string,
    input: UpdateAcademicYearInput
  ): Promise<AcademicYearRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Academic year not found");
    }

    if (input.code && input.code.trim().toUpperCase() !== existing.code.toUpperCase()) {
      const duplicate = await this.repo.findByCode(tenantId, input.code);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          `Academic year with code "${input.code}" already exists in this school`
        );
      }
    }

    const start = input.startDate ? new Date(input.startDate) : existing.startDate;
    const end = input.endDate ? new Date(input.endDate) : existing.endDate;
    if (end <= start) {
      throw new BadRequestError("End date must be chronologically after start date");
    }

    return this.repo.update(tenantId, id, input);
  }

  async setActiveAcademicYear(
    tenantId: string,
    id: string
  ): Promise<AcademicYearRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Academic year not found");
    }

    return this.repo.setActive(tenantId, id);
  }

  async archiveAcademicYear(
    tenantId: string,
    id: string
  ): Promise<AcademicYearRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Academic year not found");
    }
    if (existing.status === "ACTIVE") {
      throw new BadRequestError("Cannot archive the currently active academic year");
    }

    return this.repo.archive(tenantId, id);
  }

  async restoreAcademicYear(
    tenantId: string,
    id: string
  ): Promise<AcademicYearRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Academic year not found");
    }

    return this.repo.restore(tenantId, id);
  }
}

export const academicYearService = new AcademicYearService();
