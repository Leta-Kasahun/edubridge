import {
  curriculumRepository,
  CurriculumRepository,
} from "../repository/curriculum.repository.js";
import {
  CurriculumRecord,
  CurriculumDetailRecord,
  CurriculumVersionRecord,
  CreateCurriculumInput,
  UpdateCurriculumInput,
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  CurriculumFilterParams,
  PaginatedCurriculaResult,
} from "../types/curriculum.types.js";
import {
  CurriculumStatusType,
  CurriculumVersionStatusType,
} from "../../../../shared/constants/curriculum.constants.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import { normalizeCurriculumCode } from "../../../../shared/utils/curriculum-tree.util.js";

export class CurriculumService {
  constructor(
    private readonly repo: CurriculumRepository = curriculumRepository
  ) {}

  async getCurricula(
    tenantId: string,
    params: Omit<CurriculumFilterParams, "tenantId"> = {}
  ): Promise<PaginatedCurriculaResult> {
    return this.repo.findMany({
      ...params,
      tenantId,
    });
  }

  async getCurriculumById(
    tenantId: string,
    id: string
  ): Promise<CurriculumDetailRecord> {
    const curriculum = await this.repo.findById(tenantId, id);
    if (!curriculum) {
      throw new NotFoundError("Curriculum not found");
    }
    return curriculum;
  }

  async createCurriculum(
    tenantId: string,
    input: CreateCurriculumInput
  ): Promise<CurriculumDetailRecord> {
    const normalizedCode = normalizeCurriculumCode(input.code);
    const targetTenantId = input.scope === "SYSTEM" ? null : tenantId;

    const existing = await this.repo.findByCode(targetTenantId, normalizedCode);
    if (existing) {
      throw new ConflictError(
        `Curriculum with code "${normalizedCode}" already exists`
      );
    }

    return this.repo.create(tenantId, {
      ...input,
      code: normalizedCode,
      initialVersionCode: input.initialVersionCode
        ? normalizeCurriculumCode(input.initialVersionCode)
        : "v1",
    });
  }

  async updateCurriculum(
    tenantId: string,
    id: string,
    input: UpdateCurriculumInput
  ): Promise<CurriculumRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Curriculum not found");
    }

    if (existing.scope === "SYSTEM" && existing.tenantId === null) {
      throw new BadRequestError("System-level curricula cannot be modified directly");
    }

    return this.repo.update(id, input);
  }

  async changeCurriculumStatus(
    tenantId: string,
    id: string,
    status: CurriculumStatusType
  ): Promise<CurriculumRecord> {
    const existing = await this.repo.findById(tenantId, id);
    if (!existing) {
      throw new NotFoundError("Curriculum not found");
    }

    if (existing.scope === "SYSTEM" && existing.tenantId === null) {
      throw new BadRequestError("System-level curricula status cannot be changed directly");
    }

    return this.repo.setStatus(id, status);
  }

  async createCurriculumVersion(
    tenantId: string,
    curriculumId: string,
    input: CreateCurriculumVersionInput
  ): Promise<CurriculumVersionRecord> {
    const curriculum = await this.repo.findById(tenantId, curriculumId);
    if (!curriculum) {
      throw new NotFoundError("Curriculum not found");
    }

    if (curriculum.scope === "SYSTEM" && curriculum.tenantId === null) {
      throw new BadRequestError("Cannot add versions to system-level curricula");
    }

    const normalizedCode = normalizeCurriculumCode(input.code);
    const existingVersion = await this.repo.findVersionByCode(
      curriculumId,
      normalizedCode
    );
    if (existingVersion) {
      throw new ConflictError(
        `Version with code "${normalizedCode}" already exists for this curriculum`
      );
    }

    if (input.effectiveFrom && input.effectiveTo) {
      const from = new Date(input.effectiveFrom);
      const to = new Date(input.effectiveTo);
      if (to <= from) {
        throw new BadRequestError("Effective To date must be after Effective From date");
      }
    }

    return this.repo.createVersion(curriculumId, {
      ...input,
      code: normalizedCode,
    });
  }

  async updateCurriculumVersion(
    tenantId: string,
    curriculumId: string,
    versionId: string,
    input: UpdateCurriculumVersionInput
  ): Promise<CurriculumVersionRecord> {
    const curriculum = await this.repo.findById(tenantId, curriculumId);
    if (!curriculum) {
      throw new NotFoundError("Curriculum not found");
    }

    const version = await this.repo.findVersionById(versionId);
    if (!version || version.curriculumId !== curriculumId) {
      throw new NotFoundError("Curriculum version not found");
    }

    if (version.status === "ARCHIVED") {
      throw new BadRequestError("Archived curriculum versions cannot be modified");
    }

    if (input.effectiveFrom && input.effectiveTo) {
      const from = new Date(input.effectiveFrom);
      const to = new Date(input.effectiveTo);
      if (to <= from) {
        throw new BadRequestError("Effective To date must be after Effective From date");
      }
    }

    return this.repo.updateVersion(versionId, input);
  }

  async changeCurriculumVersionStatus(
    tenantId: string,
    curriculumId: string,
    versionId: string,
    status: CurriculumVersionStatusType
  ): Promise<CurriculumVersionRecord> {
    const curriculum = await this.repo.findById(tenantId, curriculumId);
    if (!curriculum) {
      throw new NotFoundError("Curriculum not found");
    }

    const version = await this.repo.findVersionById(versionId);
    if (!version || version.curriculumId !== curriculumId) {
      throw new NotFoundError("Curriculum version not found");
    }

    return this.repo.setVersionStatus(curriculumId, versionId, status);
  }
}

export const curriculumService = new CurriculumService();
