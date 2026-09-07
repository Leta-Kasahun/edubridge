import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  NotificationItem,
  NotificationListResult,
  NotificationPreference,
} from "../types/notification.types";

export interface ListNotificationsParams {
  isRead?: boolean;
  category?: string;
  page?: number;
  limit?: number;
}

const BASE = API_ENDPOINTS.NOTIFICATIONS;

export const notificationApiService = {
  list: async (params?: ListNotificationsParams) => {
    const res = await apiClient.get<ApiResponse<NotificationListResult>>(BASE.BASE, {
      params,
    });
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ count: number }>>(
      BASE.UNREAD_COUNT
    );
    return res.data.data.count;
  },

  markRead: async (ids: string[]): Promise<void> => {
    await apiClient.patch(BASE.MARK_READ, { ids });
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(BASE.MARK_ALL_READ);
  },

  getPreferences: async (): Promise<NotificationPreference[]> => {
    const res = await apiClient.get<ApiResponse<NotificationPreference[]>>(
      BASE.PREFERENCES
    );
    return res.data.data;
  },

  upsertPreference: async (
    category: string,
    channel: string,
    enabled: boolean
  ): Promise<NotificationPreference> => {
    const res = await apiClient.put<ApiResponse<NotificationPreference>>(
      BASE.PREFERENCES,
      { category, channel, enabled }
    );
    return res.data.data;
  },
};
