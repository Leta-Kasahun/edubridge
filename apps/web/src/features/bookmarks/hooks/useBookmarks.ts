import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkService } from "../services/bookmark.service";
import {
  BookmarkTargetType,
  ListBookmarksParams,
  ToggleBookmarkPayload,
} from "../types/bookmark.types";
import { useAuthStore } from "@/stores/auth.store";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { outboxRepository, bookmarkCacheRepository } from "@/features/offline";

export const BOOKMARK_QUERY_KEYS = {
  all: ["bookmarks"] as const,
  list: (params?: ListBookmarksParams) => [...BOOKMARK_QUERY_KEYS.all, "list", params] as const,
  check: (targetType: BookmarkTargetType, targetIds: readonly string[]) =>
    [...BOOKMARK_QUERY_KEYS.all, "check", targetType, targetIds] as const,
};

export function useBookmarks(params?: ListBookmarksParams) {
  return useQuery({
    queryKey: BOOKMARK_QUERY_KEYS.list(params),
    queryFn: () => bookmarkService.getBookmarks(params),
    staleTime: 30_000,
  });
}

export function useCheckBookmarks(
  targetType: BookmarkTargetType,
  targetIds: readonly string[]
) {
  return useQuery({
    queryKey: BOOKMARK_QUERY_KEYS.check(targetType, targetIds),
    queryFn: async () => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const tenantId = useAuthStore.getState().tenantId;
      const studentId = useAuthStore.getState().user?.id;

      if (isOffline && tenantId && studentId) {
        const localIds = await bookmarkCacheRepository.checkLocal(
          tenantId,
          studentId,
          targetType,
          targetIds
        );
        return { bookmarkedIds: localIds };
      }

      try {
        const result = await bookmarkService.checkBookmarks({
          targetType,
          targetIds,
        });

        if (tenantId && studentId && result.bookmarkedIds) {
          const toCache = result.bookmarkedIds.map((id) => ({
            id: `${tenantId}:${studentId}:${targetType}:${id}`,
            tenantId,
            studentId,
            targetType,
            targetId: id,
            isBookmarked: true,
            updatedAt: Date.now(),
          }));
          bookmarkCacheRepository.cacheBatch(toCache);
        }

        return result;
      } catch (err: unknown) {
        if (tenantId && studentId) {
          const localIds = await bookmarkCacheRepository.checkLocal(
            tenantId,
            studentId,
            targetType,
            targetIds
          );
          return { bookmarkedIds: localIds };
        }
        throw err;
      }
    },
    enabled: targetIds.length > 0,
    staleTime: 60_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ToggleBookmarkPayload) => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const tenantId = useAuthStore.getState().tenantId;
      const studentId = useAuthStore.getState().user?.id;
      const resolvedTargetType = payload.targetType || "QUESTION";

      if (tenantId && studentId) {
        const nextState = await bookmarkCacheRepository.toggleLocal(
          tenantId,
          studentId,
          resolvedTargetType,
          payload.targetId,
          payload.note
        );

        if (isOffline) {
          await outboxRepository.enqueue({
            tenantId,
            userId: studentId,
            targetEntityKey: `bookmark:${resolvedTargetType}:${payload.targetId}`,
            actionType: "TOGGLE_BOOKMARK",
            endpoint: API_ENDPOINTS.BOOKMARKS.TOGGLE,
            method: "POST",
            payload: {
              targetType: resolvedTargetType,
              targetId: payload.targetId,
              note: payload.note,
            },
            idempotencyKey: `${studentId}:bookmark:${payload.targetId}`,
            clientTimestamp: Date.now(),
            conflictStrategy: "LAST_WRITE_WINS",
          });

          return { bookmarked: nextState };
        }
      }

      return bookmarkService.toggleBookmark(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARK_QUERY_KEYS.all });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const tenantId = useAuthStore.getState().tenantId;
      const studentId = useAuthStore.getState().user?.id;

      if (isOffline && tenantId && studentId) {
        await outboxRepository.enqueue({
          tenantId,
          userId: studentId,
          targetEntityKey: `bookmark:delete:${id}`,
          actionType: "TOGGLE_BOOKMARK",
          endpoint: `${API_ENDPOINTS.BOOKMARKS.BASE}/${id}`,
          method: "DELETE",
          payload: { id },
          idempotencyKey: `${studentId}:bookmark-delete:${id}`,
          clientTimestamp: Date.now(),
          conflictStrategy: "LAST_WRITE_WINS",
        });
        return;
      }

      await bookmarkService.deleteBookmark(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARK_QUERY_KEYS.all });
    },
  });
}
