import {
  TopicRepository,
  topicRepository,
} from "../repository/topic.repository.js";
import {
  UnitRepository,
  unitRepository,
} from "../repository/unit.repository.js";
import {
  StructureAccessService,
  structureAccessService,
} from "./structure-access.service.js";
import {
  CurriculumTopicRecord,
  CreateTopicInput,
  UpdateTopicInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../../shared/exceptions/index.js";
import { generateTopicCode } from "../../../../shared/utils/generators.js";

export class TopicService {
  constructor(
    private readonly repository: TopicRepository = topicRepository,
    private readonly unitRepo: UnitRepository = unitRepository,
    private readonly accessService: StructureAccessService = structureAccessService
  ) {}

  async getTopicsByUnit(
    tenantId: string | null,
    unitId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<CurriculumTopicRecord>> {
    const context = await this.unitRepo.getUnitContext(unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      false
    );

    return this.repository.findTopicsByUnitId(unitId, params);
  }

  async getTopicById(
    tenantId: string | null,
    topicId: string
  ): Promise<CurriculumTopicRecord> {
    const context = await this.repository.getTopicContext(topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      false
    );

    const topic = await this.repository.findTopicById(topicId);
    if (!topic) {
      throw new NotFoundError("Curriculum topic not found");
    }

    return topic;
  }

  async createTopic(
    tenantId: string | null,
    input: CreateTopicInput
  ): Promise<CurriculumTopicRecord> {
    const context = await this.unitRepo.getUnitContext(input.unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const existingTopicsResult = await this.repository.findTopicsByUnitId(
      input.unitId,
      { limit: 100 }
    );
    const existingTopics = existingTopicsResult.data;

    const orderIndex =
      input.orderIndex ??
      (await this.repository.findNextTopicOrderIndex(input.unitId));

    let finalCode: string;
    const rawCode = input.code?.trim();
    if (!rawCode) {
      finalCode = generateTopicCode(context.code, orderIndex);
      let collisionCounter = 1;
      while (existingTopics.some((t) => t.code.toLowerCase() === finalCode.toLowerCase())) {
        finalCode = `${generateTopicCode(context.code, orderIndex)}-${collisionCounter}`;
        collisionCounter++;
      }
    } else {
      finalCode = rawCode;
      const codeExists = existingTopics.some(
        (t) => t.code.toLowerCase() === finalCode.toLowerCase()
      );
      if (codeExists) {
        throw new ConflictError(
          `Topic code '${finalCode}' already exists for this unit`
        );
      }
    }

    return this.repository.createTopic({
      ...input,
      code: finalCode,
      orderIndex,
    });
  }

  async updateTopic(
    tenantId: string | null,
    topicId: string,
    input: UpdateTopicInput
  ): Promise<CurriculumTopicRecord> {
    const context = await this.repository.getTopicContext(topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    return this.repository.updateTopic(topicId, input);
  }

  async deleteTopic(tenantId: string | null, topicId: string): Promise<void> {
    const context = await this.repository.getTopicContext(topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const deps = await this.repository.countTopicDependencies(topicId);
    if (deps.contentCount > 0 || deps.questionCount > 0 || deps.evidenceCount > 0) {
      throw new BadRequestError(
        `Cannot delete topic '${context.title}' because it has active dependencies (${deps.contentCount} materials, ${deps.questionCount} questions, ${deps.evidenceCount} evidence records). Archive or unassign them first.`
      );
    }

    await this.repository.deleteTopic(topicId);
  }

  async reorderTopics(
    tenantId: string | null,
    unitId: string,
    orderedIds: readonly string[]
  ): Promise<void> {
    const context = await this.unitRepo.getUnitContext(unitId);
    if (!context) {
      throw new NotFoundError("Curriculum unit not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const existingTopicsResult = await this.repository.findTopicsByUnitId(
      unitId,
      { limit: 100 }
    );
    const existingIds = new Set(existingTopicsResult.data.map((t) => t.id));

    const allBelong = orderedIds.every((id) => existingIds.has(id));
    if (!allBelong || orderedIds.length !== existingIds.size) {
      throw new BadRequestError(
        "Invalid topic reorder payload: all topics of the unit must be provided"
      );
    }

    await this.repository.reorderTopics(unitId, orderedIds);
  }
}

export const topicService = new TopicService();
