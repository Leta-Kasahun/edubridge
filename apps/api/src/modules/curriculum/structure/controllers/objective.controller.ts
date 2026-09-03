import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  ObjectiveService,
  objectiveService,
} from "../services/objective.service.js";
import { getTenantId } from "./controller.utils.js";
import {
  createObjectiveSchema,
  updateObjectiveSchema,
  structureFilterSchema,
  topicIdParamSchema,
  objectiveIdParamSchema,
} from "../schemas/structure.schema.js";

export class ObjectiveController {
  constructor(
    private readonly service: ObjectiveService = objectiveService
  ) {}

  getObjectivesByTopic = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { topicId } = topicIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const params = structureFilterSchema.parse(req.query);

      const result = await this.service.getObjectivesByTopic(
        tenantId,
        topicId,
        params
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    }
  );

  getObjectiveById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { objectiveId } = objectiveIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      const objective = await this.service.getObjectiveById(
        tenantId,
        objectiveId
      );

      res.status(200).json({
        success: true,
        data: objective,
      });
    }
  );

  createObjective = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req) || null;
      const input = createObjectiveSchema.parse(req.body);

      const objective = await this.service.createObjective(tenantId, input);

      res.status(201).json({
        success: true,
        data: objective,
      });
    }
  );

  updateObjective = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { objectiveId } = objectiveIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const input = updateObjectiveSchema.parse(req.body);

      const objective = await this.service.updateObjective(
        tenantId,
        objectiveId,
        input
      );

      res.status(200).json({
        success: true,
        data: objective,
      });
    }
  );

  deleteObjective = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { objectiveId } = objectiveIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      await this.service.deleteObjective(tenantId, objectiveId);

      res.status(200).json({
        success: true,
        message: "Learning objective deleted successfully",
      });
    }
  );
}

export const objectiveController = new ObjectiveController();
