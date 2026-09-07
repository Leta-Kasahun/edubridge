"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/stores/notification.store";
import { notificationApiService, ListNotificationsParams } from "../services/notification.service";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (params?: ListNotificationsParams) =>
    ["notifications", "list", params] as const,
  unreadCount: () => ["notifications", "unread-count"] as const,
  preferences: () => ["notifications", "preferences"] as const,
};

export function useNotificationList(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationApiService.list(params),
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: async () => {
      const count = await notificationApiService.getUnreadCount();
      setUnreadCount(count);
      return count;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  const markLocalRead = useNotificationStore((s) => s.markLocalRead);

  return useMutation({
    mutationFn: (ids: string[]) => notificationApiService.markRead(ids),
    onSuccess: (_data, ids) => {
      markLocalRead(ids);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const markAllLocalRead = useNotificationStore((s) => s.markAllLocalRead);

  return useMutation({
    mutationFn: () => notificationApiService.markAllRead(),
    onSuccess: () => {
      markAllLocalRead();
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences(),
    queryFn: () => notificationApiService.getPreferences(),
    staleTime: 300_000,
  });
}

export function useUpsertPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category,
      channel,
      enabled,
    }: {
      category: string;
      channel: string;
      enabled: boolean;
    }) => notificationApiService.upsertPreference(category, channel, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences() });
    },
  });
}
