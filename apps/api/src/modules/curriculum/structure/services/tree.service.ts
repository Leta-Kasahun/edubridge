import {
  TreeRepository,
  treeRepository,
} from "../repository/tree.repository.js";
import {
  StructureAccessService,
  structureAccessService,
} from "./structure-access.service.js";
import { UnitService, unitService } from "./unit.service.js";
import { TopicService, topicService } from "./topic.service.js";
import { ObjectiveService, objectiveService } from "./objective.service.js";
import {
  CurriculumTreeView,
  ReorderStructureItemsInput,
} from "../types/structure.types.js";
import { NotFoundError } from "../../../../shared/exceptions/index.js";

export class TreeService {
  constructor(
    private readonly repository: TreeRepository = treeRepository,
    private readonly accessService: StructureAccessService = structureAccessService,
    private readonly unitSvc: UnitService = unitService,
    private readonly topicSvc: TopicService = topicService,
    private readonly objectiveSvc: ObjectiveService = objectiveService
  ) {}

  async getStructureTree(
    tenantId: string | null,
    versionId: string
  ): Promise<CurriculumTreeView> {
    await this.accessService.verifyVersionAccess(tenantId, versionId, false);

    const tree = await this.repository.getStructureTree(versionId);
    if (!tree) {
      throw new NotFoundError("Curriculum structure tree could not be loaded");
    }

    return tree;
  }

  async reorder(
    tenantId: string | null,
    input: ReorderStructureItemsInput
  ): Promise<void> {
    switch (input.entityType) {
      case "unit":
        await this.unitSvc.reorderUnits(tenantId, input.parentId, input.orderedIds);
        break;
      case "topic":
        await this.topicSvc.reorderTopics(tenantId, input.parentId, input.orderedIds);
        break;
      case "objective":
        await this.objectiveSvc.reorderObjectives(
          tenantId,
          input.parentId,
          input.orderedIds
        );
        break;
    }
  }
}

export const treeService = new TreeService();
