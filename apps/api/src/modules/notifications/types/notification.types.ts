import {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from "../../../generated/prisma/client.js";

export interface CreateNotificationInput {
  tenantId: string;
  userId: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  sourceType?: string;
  sourceId?: string;
  channels?: NotificationChannel[];
}

export interface NotificationListFilters {
  isRead?: boolean;
  category?: NotificationCategory;
  page?: number;
  limit?: number;
}

export interface NotificationListResult {
  items: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  sourceType: string | null;
  sourceId: string | null;
  createdAt: Date;
}

export interface UpdateDeliveryStatusInput {
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  providerRef?: string;
  errorMessage?: string;
}

export interface UpsertPreferenceInput {
  userId: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
}

// SSE payload shape pushed to clients
export interface SseNotificationPayload {
  id: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}
