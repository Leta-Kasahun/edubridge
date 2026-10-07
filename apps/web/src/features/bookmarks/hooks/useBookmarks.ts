import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkService } from "../services/bookmark.service";
import {
  BookmarkTargetType,
  ListBookmarksParams,
  ToggleBookmarkPayload,
} from "../types/bookmark.types";

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
    queryFn: () =>
      bookmarkService.checkBookmarks({
        targetType,
        targetIds,
      }),
    enabled: targetIds.length > 0,
    staleTime: 60_000,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ToggleBookmarkPayload) =>
      bookmarkService.toggleBookmark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARK_QUERY_KEYS.all });
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarkService.deleteBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARK_QUERY_KEYS.all });
    },
  });
}
