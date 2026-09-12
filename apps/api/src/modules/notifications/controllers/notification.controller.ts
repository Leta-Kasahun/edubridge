import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { BadRequestError } from "../../../shared/exceptions/index.js";
import { notificationService } from "../services/notification.service.js";
import { NotificationCategory, NotificationChannel } from "../../../generated/prisma/client.js";

export class NotificationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const { isRead, category, page, limit } = req.query as Record<string, string>;

    const result = await notificationService.list(tenantId, userId, {
      isRead: isRead !== undefined ? isRead === "true" : undefined,
      category: category as NotificationCategory | undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
    });

    res.status(200).json({ success: true, data: result });
  });

  unreadCount = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(tenantId, userId);
    res.status(200).json({ success: true, data: { count } });
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const { ids } = req.body as { ids: string[] };
    if (!ids?.length) {
      throw new BadRequestError("ids array is required", "IDS_REQUIRED");
    }
    await notificationService.markRead(tenantId, userId, ids);
    res.status(200).json({ success: true, data: null });
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    await notificationService.markAllRead(tenantId, userId);
    res.status(200).json({ success: true, data: null });
  });

  getPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const preferences = await notificationService.getPreferences(userId);
    res.status(200).json({ success: true, data: preferences });
  });

  upsertPreference = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { category, channel, enabled } = req.body as {
      category: NotificationCategory;
      channel: NotificationChannel;
      enabled: boolean;
    };
    const result = await notificationService.upsertPreference({
      userId,
      category,
      channel,
      enabled,
    });
    res.status(200).json({ success: true, data: result });
  });

  send = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = req.tenantId!;
    const notification = await notificationService.create({
      tenantId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: notification });
  });
}

export const notificationController = new NotificationController();
