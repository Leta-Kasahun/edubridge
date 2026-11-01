import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  activityLogService,
  ActivityLogService,
} from "../services/activity-log.service.js";
import { activityLogQuerySchema } from "../schemas/activity-log.schema.js";

export class ActivityLogController {
  constructor(
    private readonly service: ActivityLogService = activityLogService
  ) { }

  list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = activityLogQuerySchema.parse(req.query);

    const currentUser = {
      userId: req.user!.userId,
      tenantId: req.user!.tenantId,
      roles: req.user!.roles,
    };

    const result = await this.service.listActivities(query, currentUser);

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  stats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser = {
      tenantId: req.user!.tenantId,
      roles: req.user!.roles,
    };

    const stats = await this.service.getStats(currentUser);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export const activityLogController = new ActivityLogController();

