export type NotificationCategory =
  | "ACADEMIC"
  | "ASSESSMENT"
  | "CONTENT"
  | "TEACHER"
  | "SECURITY"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS";

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
  readAt: string | null;
  sourceType: string | null;
  sourceId: string | null;
  createdAt: string;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationListResult {
  items: NotificationItem[];
  meta: NotificationListMeta;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  category: NotificationCategory;
  channel: NotificationChannel;
  enabled: boolean;
}

// SSE push payload
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
