import {
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from "../../../../shared/exceptions/index.js";
import {
  curriculumRepository,
  CurriculumRepository,
} from "../../curricula/repository/curriculum.repository.js";

export class StructureAccessService {
  constructor(
    private readonly curriculumRepo: CurriculumRepository = curriculumRepository
  ) {}

  verifyCurriculumAccess(
    tenantId: string | null,
    curriculum: { tenantId: string | null; scope: string; status: string },
    requireEditable = false
  ): void {
    if (curriculum.scope === "TENANT") {
      if (!tenantId || curriculum.tenantId !== tenantId) {
        throw new ForbiddenError("Access to this curriculum is denied");
      }
    } else if (curriculum.scope === "SYSTEM") {
      if (requireEditable) {
        throw new ForbiddenError(
          "System-wide curriculum cannot be modified directly by tenants"
        );
      }
    }

    if (requireEditable && curriculum.status === "ARCHIVED") {
      throw new BadRequestError("Archived curriculum cannot be modified");
    }
  }

  async verifyVersionAccess(
    tenantId: string | null,
    versionId: string,
    requireEditable = false
  ) {
    const version = await this.curriculumRepo.findVersionById(versionId);
    if (!version) {
      throw new NotFoundError("Curriculum version not found");
    }

    if (requireEditable && version.status === "ARCHIVED") {
      throw new BadRequestError(
        "Archived curriculum versions cannot be modified"
      );
    }

    const curriculum = await this.curriculumRepo.findById(
      tenantId,
      version.curriculumId
    );
    if (!curriculum) {
      throw new NotFoundError("Curriculum not found");
    }

    this.verifyCurriculumAccess(tenantId, curriculum, requireEditable);

    return { version, curriculum };
  }
}

export const structureAccessService = new StructureAccessService();
