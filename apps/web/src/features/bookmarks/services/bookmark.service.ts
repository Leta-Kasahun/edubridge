import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse, PaginationMeta } from "@/shared/types";
import {
  BookmarkItem,
  ToggleBookmarkPayload,
  ToggleBookmarkResponse,
  CheckBookmarksPayload,
  CheckBookmarksResponse,
  ListBookmarksParams,
} from "../types/bookmark.types";

interface RawBookmarksResponse extends ApiResponse<BookmarkItem[]> {
  pagination?: PaginationMeta;
}

export const bookmarkService = {
  async toggleBookmark(payload: ToggleBookmarkPayload): Promise<ToggleBookmarkResponse> {
    const response = await apiClient.post<ApiResponse<ToggleBookmarkResponse>>(
      API_ENDPOINTS.BOOKMARKS.TOGGLE,
      {
        targetType: payload.targetType || "QUESTION",
        targetId: payload.targetId,
        note: payload.note,
      }
    );
    return response.data.data;
  },

  async checkBookmarks(payload: CheckBookmarksPayload): Promise<CheckBookmarksResponse> {
    const response = await apiClient.post<ApiResponse<CheckBookmarksResponse>>(
      API_ENDPOINTS.BOOKMARKS.CHECK,
      {
        targetType: payload.targetType || "QUESTION",
        targetIds: payload.targetIds,
      }
    );
    return response.data.data;
  },

  async getBookmarks(params?: ListBookmarksParams): Promise<{
    items: BookmarkItem[];
    pagination?: PaginationMeta;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.targetType) searchParams.append("targetType", params.targetType);
    if (params?.subjectId) searchParams.append("subjectId", params.subjectId);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.BOOKMARKS.BASE}?${qs}`
      : API_ENDPOINTS.BOOKMARKS.BASE;

    const response = await apiClient.get<RawBookmarksResponse>(endpoint);
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async deleteBookmark(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.BOOKMARKS.BY_ID(id));
  },
};
