import {
  UnitRepository,
  unitRepository,
} from "../repository/unit.repository.js";
import {
  SubjectRepository,
  subjectRepository,
} from "../repository/subject.repository.js";
import {
  StructureAccessService,
  structureAccessService,
} from "./structure-access.service.js";
import {
  CurriculumUnitRecord,
  CreateUnitInput,
  UpdateUnitInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../../shared/exceptions/index.js";
import { generateUnitCode } from "../../../../shared/utils/generators.js";

export class UnitService {
  constructor(
    private readonly repository: UnitRepository = unitRepository,
    private readonly subjectRepo: SubjectRepository = subjectRepository,
    private readonly accessService: StructureAccessService = structureAccessService
  ) {}

  async getUnitsBySubject(
    tenantId: string | null,
    subjectId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<CurriculumUnitRecord>> {
    const context = await this.subjectRepo.getCurriculumSubjectContext(subjectId);
    if (!context) {
      throw new NotFoundError("Curriculum subject not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumVersion.curriculum,
      false
    );

    return this.repository.findUnitsBySubjectId(subjectId, params);
  }

  async getUnitById(
    tenantId: string | null,
    unitId: string
  ): Promise<CurriculumUnitRecord> {
    const context = await this.repository.getUnitContext(unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      false
    );

    const unit = await this.repository.findUnitById(unitId);
    if (!unit) {
      throw new NotFoundError("Curriculum unit not found");
    }

    return unit;
  }

  async createUnit(
    tenantId: string | null,
    input: CreateUnitInput
  ): Promise<CurriculumUnitRecord> {
    const context = await this.subjectRepo.getCurriculumSubjectContext(
      input.curriculumSubjectId
    );
    if (!context) {
      throw new NotFoundError("Curriculum subject not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumVersion.curriculum,
      true
    );

    const existingUnitsResult = await this.repository.findUnitsBySubjectId(
      input.curriculumSubjectId,
      { limit: 100 }
    );
    const existingUnits = existingUnitsResult.data;

    const orderIndex =
      input.orderIndex ??
      (await this.repository.findNextUnitOrderIndex(input.curriculumSubjectId));

    let finalCode: string;
    const rawCode = input.code?.trim();
    if (!rawCode) {
      finalCode = generateUnitCode(orderIndex);
      let collisionCounter = 1;
      while (existingUnits.some((u) => u.code.toLowerCase() === finalCode.toLowerCase())) {
        finalCode = `${generateUnitCode(orderIndex)}-${collisionCounter}`;
        collisionCounter++;
      }
    } else {
      finalCode = rawCode;
      const codeExists = existingUnits.some(
        (u) => u.code.toLowerCase() === finalCode.toLowerCase()
      );
      if (codeExists) {
        throw new ConflictError(
          `Unit code '${finalCode}' already exists for this subject`
        );
      }
    }

    return this.repository.createUnit({
      ...input,
      code: finalCode,
      orderIndex,
    });
  }

  async updateUnit(
    tenantId: string | null,
    unitId: string,
    input: UpdateUnitInput
  ): Promise<CurriculumUnitRecord> {
    const context = await this.repository.getUnitContext(unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    return this.repository.updateUnit(unitId, input);
  }

  async deleteUnit(tenantId: string | null, unitId: string): Promise<void> {
    const context = await this.repository.getUnitContext(unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const deps = await this.repository.countUnitDependencies(unitId);
    if (deps.contentCount > 0 || deps.questionCount > 0 || deps.evidenceCount > 0) {
      throw new BadRequestError(
        `Cannot delete unit '${context.title}' because it has active dependencies (${deps.contentCount} materials, ${deps.questionCount} questions, ${deps.evidenceCount} evidence records). Archive or unassign them first.`
      );
    }

    await this.repository.deleteUnit(unitId);
  }

  async reorderUnits(
    tenantId: string | null,
    subjectId: string,
    orderedIds: readonly string[]
  ): Promise<void> {
    const context = await this.subjectRepo.getCurriculumSubjectContext(subjectId);
    if (!context) {
      throw new NotFoundError("Curriculum subject not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumVersion.curriculum,
      true
    );

    const existingUnitsResult = await this.repository.findUnitsBySubjectId(
      subjectId,
      { limit: 100 }
    );
    const existingIds = new Set(existingUnitsResult.data.map((u) => u.id));

    const allBelong = orderedIds.every((id) => existingIds.has(id));
    if (!allBelong || orderedIds.length !== existingIds.size) {
      throw new BadRequestError(
        "Invalid unit reorder payload: all units of the subject must be provided"
      );
    }

    await this.repository.reorderUnits(subjectId, orderedIds);
  }
}

export const unitService = new UnitService();
