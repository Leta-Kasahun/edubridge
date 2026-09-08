import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  Prisma,
} from "../../../generated/prisma/client.js";
import {
  CreateNotificationInput,
  NotificationListFilters,
  UpsertPreferenceInput,
} from "../types/notification.types.js";

export class NotificationRepository {
  async create(data: CreateNotificationInput) {
    return runWithoutTenant(() =>
      prisma.notification.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          category: data.category as NotificationCategory,
          priority: (data.priority ?? "NORMAL") as NotificationPriority,
          title: data.title,
          body: data.body,
          actionUrl: data.actionUrl ?? null,
          metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
          sourceType: data.sourceType ?? null,
          sourceId: data.sourceId ?? null,
          deliveries: data.channels?.length
            ? {
                create: data.channels.map((channel) => ({
                  channel: channel as NotificationChannel,
                  status: "PENDING" as NotificationStatus,
                })),
              }
            : undefined,
        },
      })
    );
  }

  async findManyByUser(
    tenantId: string,
    userId: string,
    filters: NotificationListFilters
  ) {
    const { isRead, category, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      tenantId,
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(category && { category: category as NotificationCategory }),
    };

    return runWithoutTenant(() =>
      prisma.$transaction([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            tenantId: true,
            userId: true,
            category: true,
            priority: true,
            title: true,
            body: true,
            actionUrl: true,
            metadata: true,
            isRead: true,
            readAt: true,
            sourceType: true,
            sourceId: true,
            createdAt: true,
          },
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({ where: { tenantId, userId, isRead: false } }),
      ])
    );
  }

  async markReadMany(tenantId: string, userId: string, ids: string[]) {
    return runWithoutTenant(() =>
      prisma.notification.updateMany({
        where: { id: { in: ids }, tenantId, userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
    );
  }

  async markAllRead(tenantId: string, userId: string) {
    return runWithoutTenant(() =>
      prisma.notification.updateMany({
        where: { tenantId, userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
    );
  }

  async countUnread(tenantId: string, userId: string): Promise<number> {
    return runWithoutTenant(() =>
      prisma.notification.count({ where: { tenantId, userId, isRead: false } })
    );
  }

  async upsertPreference(data: UpsertPreferenceInput) {
    return runWithoutTenant(() =>
      prisma.notificationPreference.upsert({
        where: {
          userId_category_channel: {
            userId: data.userId,
            category: data.category as NotificationCategory,
            channel: data.channel as NotificationChannel,
          },
        },
        update: { enabled: data.enabled },
        create: {
          userId: data.userId,
          category: data.category as NotificationCategory,
          channel: data.channel as NotificationChannel,
          enabled: data.enabled,
        },
      })
    );
  }

  async findPreferencesByUser(userId: string) {
    return runWithoutTenant(() =>
      prisma.notificationPreference.findMany({
        where: { userId },
        orderBy: [{ category: "asc" }, { channel: "asc" }],
      })
    );
  }

  async isChannelEnabled(
    userId: string,
    category: NotificationCategory,
    channel: NotificationChannel
  ): Promise<boolean> {
    const pref = await runWithoutTenant(() =>
      prisma.notificationPreference.findUnique({
        where: { userId_category_channel: { userId, category, channel } },
        select: { enabled: true },
      })
    );
    return pref?.enabled ?? true;
  }

  async getUserEmailAndName(userId: string) {
    return runWithoutTenant(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      })
    );
  }

  async updateDeliveryStatus(
    notificationId: string,
    channel: NotificationChannel,
    status: NotificationStatus,
    extra?: { providerRef?: string; errorMessage?: string }
  ) {
    const now = new Date();
    return runWithoutTenant(() =>
      prisma.notificationDelivery.updateMany({
        where: { notificationId, channel },
        data: {
          status,
          providerRef: extra?.providerRef,
          errorMessage: extra?.errorMessage,
          sentAt: status === "SENT" ? now : undefined,
          deliveredAt: status === "DELIVERED" ? now : undefined,
          failedAt: status === "FAILED" || status === "BOUNCED" ? now : undefined,
          attemptCount: { increment: 1 },
        },
      })
    );
  }
}

export const notificationRepository = new NotificationRepository();
