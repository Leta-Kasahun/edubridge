import {
  SubjectRepository,
  subjectRepository,
} from "../repository/subject.repository.js";
import {
  StructureAccessService,
  structureAccessService,
} from "./structure-access.service.js";
import {
  CurriculumSubjectRecord,
  CreateCurriculumSubjectInput,
} from "../types/structure.types.js";
import {
  NotFoundError,
  ConflictError,
} from "../../../../shared/exceptions/index.js";

export class SubjectService {
  constructor(
    private readonly repository: SubjectRepository = subjectRepository,
    private readonly accessService: StructureAccessService = structureAccessService
  ) {}

  async getSubjectsByVersion(
    tenantId: string | null,
    versionId: string
  ): Promise<readonly CurriculumSubjectRecord[]> {
    await this.accessService.verifyVersionAccess(tenantId, versionId, false);
    return this.repository.findSubjectsByVersionId(versionId);
  }

  async createSubject(
    tenantId: string | null,
    input: CreateCurriculumSubjectInput
  ): Promise<CurriculumSubjectRecord> {
    await this.accessService.verifyVersionAccess(
      tenantId,
      input.curriculumVersionId,
      true
    );

    const existingSubjects = await this.repository.findSubjectsByVersionId(
      input.curriculumVersionId
    );

    const duplicate = existingSubjects.find(
      (s) => s.gradeId === input.gradeId && s.subjectId === input.subjectId
    );
    if (duplicate) {
      throw new ConflictError(
        "This subject is already configured for this grade in this curriculum version"
      );
    }

    return this.repository.createSubject(input);
  }

  async deleteSubject(
    tenantId: string | null,
    subjectId: string
  ): Promise<void> {
    const context = await this.repository.getCurriculumSubjectContext(subjectId);
    if (!context) {
      throw new NotFoundError("Curriculum subject not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumVersion.curriculum,
      true
    );

    await this.repository.deleteSubject(subjectId);
  }
}

export const subjectService = new SubjectService();
