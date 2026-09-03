import {
  ObjectiveRepository,
  objectiveRepository,
} from "../repository/objective.repository.js";
import {
  TopicRepository,
  topicRepository,
} from "../repository/topic.repository.js";
import {
  StructureAccessService,
  structureAccessService,
} from "./structure-access.service.js";
import {
  LearningObjectiveRecord,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  StructureFilterParams,
  PaginatedStructureResult,
} from "../types/structure.types.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../../../../shared/exceptions/index.js";
import { generateObjectiveCode } from "../../../../shared/utils/generators.js";

export class ObjectiveService {
  constructor(
    private readonly repository: ObjectiveRepository = objectiveRepository,
    private readonly topicRepo: TopicRepository = topicRepository,
    private readonly accessService: StructureAccessService = structureAccessService
  ) {}

  async getObjectivesByTopic(
    tenantId: string | null,
    topicId: string,
    params: StructureFilterParams = {}
  ): Promise<PaginatedStructureResult<LearningObjectiveRecord>> {
    const context = await this.topicRepo.getTopicContext(topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      false
    );

    return this.repository.findObjectivesByTopicId(topicId, params);
  }

  async getObjectiveById(
    tenantId: string | null,
    objectiveId: string
  ): Promise<LearningObjectiveRecord> {
    const context = await this.repository.getObjectiveContext(objectiveId);
    if (!context) {
      throw new NotFoundError("Learning objective not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.topic.unit.curriculumSubject.curriculumVersion.curriculum,
      false
    );

    const objective = await this.repository.findObjectiveById(objectiveId);
    if (!objective) {
      throw new NotFoundError("Learning objective not found");
    }

    return objective;
  }

  async createObjective(
    tenantId: string | null,
    input: CreateObjectiveInput
  ): Promise<LearningObjectiveRecord> {
    const context = await this.topicRepo.getTopicContext(input.topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const existingObjectivesResult = await this.repository.findObjectivesByTopicId(
      input.topicId,
      { limit: 100 }
    );
    const existingObjectives = existingObjectivesResult.data;

    const orderIndex =
      input.orderIndex ??
      (await this.repository.findNextObjectiveOrderIndex(input.topicId));

    let finalCode: string;
    const rawCode = input.code?.trim();
    if (!rawCode) {
      finalCode = generateObjectiveCode(context.code, orderIndex);
      let collisionCounter = 1;
      while (
        existingObjectives.some(
          (o) => o.code.toLowerCase() === finalCode.toLowerCase()
        )
      ) {
        finalCode = `${generateObjectiveCode(context.code, orderIndex)}-${collisionCounter}`;
        collisionCounter++;
      }
    } else {
      finalCode = rawCode;
      const codeExists = existingObjectives.some(
        (o) => o.code.toLowerCase() === finalCode.toLowerCase()
      );
      if (codeExists) {
        throw new ConflictError(
          `Objective code '${finalCode}' already exists for this topic`
        );
      }
    }

    return this.repository.createObjective({
      ...input,
      code: finalCode,
      orderIndex,
    });
  }

  async updateObjective(
    tenantId: string | null,
    objectiveId: string,
    input: UpdateObjectiveInput
  ): Promise<LearningObjectiveRecord> {
    const context = await this.repository.getObjectiveContext(objectiveId);
    if (!context) {
      throw new NotFoundError("Learning objective not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.topic.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    return this.repository.updateObjective(objectiveId, input);
  }

  async deleteObjective(
    tenantId: string | null,
    objectiveId: string
  ): Promise<void> {
    const context = await this.repository.getObjectiveContext(objectiveId);
    if (!context) {
      throw new NotFoundError("Learning objective not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.topic.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    await this.repository.deleteObjective(objectiveId);
  }

  async reorderObjectives(
    tenantId: string | null,
    topicId: string,
    orderedIds: readonly string[]
  ): Promise<void> {
    const context = await this.topicRepo.getTopicContext(topicId);
    if (!context) {
      throw new NotFoundError("Curriculum topic not found");
    }

    this.accessService.verifyCurriculumAccess(
      tenantId,
      context.unit.curriculumSubject.curriculumVersion.curriculum,
      true
    );

    const existingObjectivesResult = await this.repository.findObjectivesByTopicId(
      topicId,
      { limit: 100 }
    );
    const existingIds = new Set(existingObjectivesResult.data.map((o) => o.id));

    const allBelong = orderedIds.every((id) => existingIds.has(id));
    if (!allBelong || orderedIds.length !== existingIds.size) {
      throw new BadRequestError(
        "Invalid objective reorder payload: all objectives of the topic must be provided"
      );
    }

    await this.repository.reorderObjectives(topicId, orderedIds);
  }
}

export const objectiveService = new ObjectiveService();
