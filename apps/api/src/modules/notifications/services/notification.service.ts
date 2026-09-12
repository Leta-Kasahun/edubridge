import { redis, RedisKeys } from "../../../lib/redis.js";
import {
  sendEmail,
  buildEmailWrapper,
  sendRoleNotificationEmail,
} from "../../../lib/email.js";
import {
  NotificationRepository,
  notificationRepository,
} from "../repository/notification.repository.js";
import {
  CreateNotificationInput,
  NotificationListFilters,
  SseNotificationPayload,
  UpsertPreferenceInput,
} from "../types/notification.types.js";
import { NotificationCategory } from "../../../generated/prisma/client.js";

const UNREAD_COUNT_TTL = 300;

const CATEGORY_BADGES: Record<NotificationCategory, string> = {
  ACADEMIC: "Academic Update",
  ASSESSMENT: "Assessment Notice",
  CONTENT: "Learning Material",
  TEACHER: "Teacher Notice",
  SECURITY: "Security Alert",
  SYSTEM: "System Notification",
};

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository = notificationRepository
  ) {}

  private async dispatchEmail(notification: {
    id: string;
    userId: string;
    category: NotificationCategory;
    title: string;
    body: string;
    actionUrl?: string | null;
  }) {
    try {
      const user = await this.repository.getUserEmailAndName(notification.userId);
      if (!user?.email) {
        await this.repository.updateDeliveryStatus(
          notification.id,
          "EMAIL",
          "FAILED",
          { errorMessage: "User does not have an email address configured" }
        );
        return;
      }

      const toName = `${user.firstName} ${user.lastName}`.trim();
      const badge = CATEGORY_BADGES[notification.category] || "Notification";

      const actionButtonHtml = notification.actionUrl
        ? `<div style="text-align:center;margin:24px 0 12px 0;">
             <a href="${notification.actionUrl}" style="display:inline-block;background-color:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 24px;border-radius:8px;font-size:13px;box-shadow:0 1px 2px rgba(2,132,199,0.2);">View Details</a>
           </div>`
        : "";

      const content = `
        <h2 style="margin:0 0 10px 0;font-size:17px;color:#0f172a;font-weight:700;line-height:1.3;">${notification.title}</h2>
        <p style="margin:0 0 16px 0;color:#475569;font-size:13px;line-height:1.6;">Hello <strong style="color:#0f172a;">${toName}</strong>,</p>
        <p style="margin:0 0 16px 0;color:#334155;font-size:13px;line-height:1.6;">${notification.body}</p>
        ${actionButtonHtml}
      `;

      const result = await sendEmail({
        to: user.email,
        toName,
        subject: notification.title,
        html: buildEmailWrapper(notification.title, content, badge),
      });

      if (result.success) {
        await this.repository.updateDeliveryStatus(
          notification.id,
          "EMAIL",
          "SENT",
          { providerRef: result.messageId }
        );
      } else {
        await this.repository.updateDeliveryStatus(
          notification.id,
          "EMAIL",
          "FAILED",
          { errorMessage: result.error }
        );
      }
    } catch (err) {
      await this.repository.updateDeliveryStatus(
        notification.id,
        "EMAIL",
        "FAILED",
        {
          errorMessage:
            err instanceof Error ? err.message : "Unknown email dispatch failure",
        }
      );
    }
  }

  async create(input: CreateNotificationInput) {
    const notification = await this.repository.create(input);

    await redis.del(
      RedisKeys.notification.unreadCount(input.tenantId, input.userId)
    );

    const payload: SseNotificationPayload = {
      id: notification.id,
      category: notification.category,
      priority: notification.priority,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl,
      isRead: false,
      createdAt: notification.createdAt.toISOString(),
    };

    await redis.publish(
      RedisKeys.notification.userChannel(input.userId),
      JSON.stringify(payload)
    );

    if (input.channels?.includes("EMAIL")) {
      void this.dispatchEmail({
        id: notification.id,
        userId: input.userId,
        category: notification.category,
        title: input.title,
        body: input.body,
        actionUrl: input.actionUrl,
      });
    }

    return notification;
  }

  async list(
    tenantId: string,
    userId: string,
    filters: NotificationListFilters
  ) {
    const { page = 1, limit = 20 } = filters;

    const [items, total, unreadCount] = await this.repository.findManyByUser(
      tenantId,
      userId,
      filters
    );

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  async markRead(tenantId: string, userId: string, ids: string[]) {
    const result = await this.repository.markReadMany(tenantId, userId, ids);
    await redis.del(RedisKeys.notification.unreadCount(tenantId, userId));
    return result;
  }

  async markAllRead(tenantId: string, userId: string) {
    const result = await this.repository.markAllRead(tenantId, userId);
    await redis.del(RedisKeys.notification.unreadCount(tenantId, userId));
    return result;
  }

  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    const cacheKey = RedisKeys.notification.unreadCount(tenantId, userId);
    const cached = await redis.get(cacheKey);
    if (cached !== null) return Number(cached);

    const count = await this.repository.countUnread(tenantId, userId);
    await redis.set(cacheKey, String(count), "EX", UNREAD_COUNT_TTL);
    return count;
  }

  async getPreferences(userId: string) {
    return this.repository.findPreferencesByUser(userId);
  }

  async upsertPreference(input: UpsertPreferenceInput) {
    return this.repository.upsertPreference(input);
  }

  async sendToUser(input: Omit<CreateNotificationInput, "channels">) {
    const inAppEnabled = await this.repository.isChannelEnabled(
      input.userId,
      input.category,
      "IN_APP"
    );
    const emailEnabled = await this.repository.isChannelEnabled(
      input.userId,
      input.category,
      "EMAIL"
    );

    const channels: ("IN_APP" | "EMAIL")[] = [];
    if (inAppEnabled) channels.push("IN_APP");
    if (emailEnabled) channels.push("EMAIL");

    return this.create({ ...input, channels });
  }
}

export const notificationService = new NotificationService();
