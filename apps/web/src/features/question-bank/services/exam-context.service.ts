import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  ExamContextItem,
  CreateExamContextDto,
  UpdateExamContextDto,
  ExamContextFilters,
  PaginatedResponse,
} from "../types/question-bank.types";

export const examContextService = {
  async getExamContexts(
    filters: ExamContextFilters = {}
  ): Promise<PaginatedResponse<ExamContextItem>> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.scope) {
      params.append("scope", filters.scope);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.year) {
      params.append("year", String(filters.year));
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.EXAM_CONTEXTS.BASE}?${queryString}`
      : API_ENDPOINTS.EXAM_CONTEXTS.BASE;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ExamContextItem>> | { success: boolean; data: readonly ExamContextItem[]; pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }
    >(endpoint);
    const raw = response.data;
    if ("items" in raw.data && Array.isArray(raw.data.items)) {
      return raw.data as PaginatedResponse<ExamContextItem>;
    }
    if (Array.isArray(raw.data)) {
      const p = (raw as { pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }).pagination || {};
      const page = p.page ?? 1;
      const totalPages = p.totalPages ?? 1;
      return {
        items: raw.data as readonly ExamContextItem[],
        meta: {
          total: p.total ?? raw.data.length,
          page,
          limit: p.limit ?? 20,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }
    return {
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  async getExamContextById(id: string): Promise<ExamContextItem> {
    const response = await apiClient.get<ApiResponse<ExamContextItem>>(
      API_ENDPOINTS.EXAM_CONTEXTS.BY_ID(id)
    );
    return response.data.data;
  },

  async createExamContext(
    payload: CreateExamContextDto
  ): Promise<ExamContextItem> {
    const response = await apiClient.post<ApiResponse<ExamContextItem>>(
      API_ENDPOINTS.EXAM_CONTEXTS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateExamContext(
    id: string,
    payload: UpdateExamContextDto
  ): Promise<ExamContextItem> {
    const response = await apiClient.patch<ApiResponse<ExamContextItem>>(
      API_ENDPOINTS.EXAM_CONTEXTS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteExamContext(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.EXAM_CONTEXTS.BY_ID(id)
    );
    return response.data;
  },
};
