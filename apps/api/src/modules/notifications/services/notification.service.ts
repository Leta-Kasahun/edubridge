import { redis, RedisKeys } from "../../../lib/redis.js";
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

const UNREAD_COUNT_TTL = 300; // 5 minutes

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository = notificationRepository
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.repository.create(input);

    // Invalidate cached unread count
    await redis.del(RedisKeys.notification.unreadCount(input.tenantId, input.userId));

    // Publish to Redis so SSE connections on any server instance receive it
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

    return notification;
  }

  async list(tenantId: string, userId: string, filters: NotificationListFilters) {
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
    const channels = inAppEnabled ? (["IN_APP"] as const) : [];
    return this.create({ ...input, channels: [...channels] });
  }
}

export const notificationService = new NotificationService();
