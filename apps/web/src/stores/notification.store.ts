import { create } from "zustand";
import {
  NotificationItem,
  SseNotificationPayload,
} from "@/features/notifications/types/notification.types";

interface NotificationState {
  unreadCount: number;
  recentItems: NotificationItem[];
}

interface NotificationActions {
  setUnreadCount: (count: number) => void;
  decrementUnread: (by?: number) => void;
  pushSseItem: (payload: SseNotificationPayload) => void;
  markLocalRead: (ids: string[]) => void;
  markAllLocalRead: () => void;
  reset: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

const MAX_RECENT = 50;

const initialState: NotificationState = {
  unreadCount: 0,
  recentItems: [],
};

export const useNotificationStore = create<NotificationStore>()((set) => ({
  ...initialState,

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  decrementUnread: (by = 1) =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

  pushSseItem: (payload) =>
    set((s) => {
      const item: NotificationItem = {
        id: payload.id,
        tenantId: "",
        userId: "",
        category: payload.category,
        priority: payload.priority,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl,
        metadata: null,
        isRead: false,
        readAt: null,
        sourceType: null,
        sourceId: null,
        createdAt: payload.createdAt,
      };
      const next = [item, ...s.recentItems].slice(0, MAX_RECENT);
      return {
        recentItems: next,
        unreadCount: s.unreadCount + 1,
      };
    }),

  markLocalRead: (ids) =>
    set((s) => {
      const idSet = new Set(ids);
      const unreadMarked = s.recentItems.filter(
        (n) => idSet.has(n.id) && !n.isRead
      ).length;
      return {
        recentItems: s.recentItems.map((n) =>
          idSet.has(n.id)
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        ),
        unreadCount: Math.max(0, s.unreadCount - unreadMarked),
      };
    }),

  markAllLocalRead: () =>
    set((s) => ({
      unreadCount: 0,
      recentItems: s.recentItems.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
    })),

  reset: () => set(initialState),
}));
