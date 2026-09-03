import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  TopicService,
  topicService,
} from "../services/topic.service.js";
import { getTenantId } from "./controller.utils.js";
import {
  createTopicSchema,
  updateTopicSchema,
  structureFilterSchema,
  unitIdParamSchema,
  topicIdParamSchema,
} from "../schemas/structure.schema.js";

export class TopicController {
  constructor(
    private readonly service: TopicService = topicService
  ) {}

  getTopicsByUnit = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { unitId } = unitIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const params = structureFilterSchema.parse(req.query);

      const result = await this.service.getTopicsByUnit(
        tenantId,
        unitId,
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

  getTopicById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { topicId } = topicIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      const topic = await this.service.getTopicById(tenantId, topicId);

      res.status(200).json({
        success: true,
        data: topic,
      });
    }
  );

  createTopic = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId = getTenantId(req) || null;
      const input = createTopicSchema.parse(req.body);

      const topic = await this.service.createTopic(tenantId, input);

      res.status(201).json({
        success: true,
        data: topic,
      });
    }
  );

  updateTopic = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { topicId } = topicIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;
      const input = updateTopicSchema.parse(req.body);

      const topic = await this.service.updateTopic(tenantId, topicId, input);

      res.status(200).json({
        success: true,
        data: topic,
      });
    }
  );

  deleteTopic = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { topicId } = topicIdParamSchema.parse(req.params);
      const tenantId = getTenantId(req) || null;

      await this.service.deleteTopic(tenantId, topicId);

      res.status(200).json({
        success: true,
        message: "Curriculum topic deleted successfully",
      });
    }
  );
}

export const topicController = new TopicController();
