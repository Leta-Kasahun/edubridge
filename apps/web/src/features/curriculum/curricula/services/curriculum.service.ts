import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse, PaginationMeta } from "@/shared/types";
import {
  CurriculumItem,
  CurriculumDetailItem,
  CurriculumVersionItem,
  CreateCurriculumPayload,
  UpdateCurriculumPayload,
  CreateCurriculumVersionPayload,
  UpdateCurriculumVersionPayload,
  CurriculumFilters,
  CurriculumStatus,
  CurriculumVersionStatus,
} from "../types/curriculum.types";

export interface PaginatedCurriculaResponse {
  readonly success: boolean;
  readonly data: readonly CurriculumItem[];
  readonly pagination: PaginationMeta;
}

export const curriculumService = {
  async getCurricula(
    filters: CurriculumFilters = {}
  ): Promise<PaginatedCurriculaResponse> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.scope) {
      params.append("scope", filters.scope);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.version && filters.version.trim()) {
      params.append("version", filters.version.trim());
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.CURRICULA.BASE}?${queryString}`
      : API_ENDPOINTS.CURRICULA.BASE;

    const response = await apiClient.get<PaginatedCurriculaResponse>(endpoint);
    return response.data;
  },

  async getCurriculumById(id: string): Promise<CurriculumDetailItem> {
    const response = await apiClient.get<ApiResponse<CurriculumDetailItem>>(
      API_ENDPOINTS.CURRICULA.BY_ID(id)
    );
    return response.data.data;
  },

  async createCurriculum(
    payload: CreateCurriculumPayload
  ): Promise<CurriculumDetailItem> {
    const response = await apiClient.post<ApiResponse<CurriculumDetailItem>>(
      API_ENDPOINTS.CURRICULA.BASE,
      payload
    );
    return response.data.data;
  },

  async updateCurriculum(
    id: string,
    payload: UpdateCurriculumPayload
  ): Promise<CurriculumItem> {
    const response = await apiClient.put<ApiResponse<CurriculumItem>>(
      API_ENDPOINTS.CURRICULA.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async changeCurriculumStatus(
    id: string,
    status: CurriculumStatus
  ): Promise<CurriculumItem> {
    const response = await apiClient.patch<ApiResponse<CurriculumItem>>(
      API_ENDPOINTS.CURRICULA.STATUS(id),
      { status }
    );
    return response.data.data;
  },

  async createVersion(
    curriculumId: string,
    payload: CreateCurriculumVersionPayload
  ): Promise<CurriculumVersionItem> {
    const response = await apiClient.post<ApiResponse<CurriculumVersionItem>>(
      API_ENDPOINTS.CURRICULA.VERSIONS(curriculumId),
      payload
    );
    return response.data.data;
  },

  async updateVersion(
    curriculumId: string,
    versionId: string,
    payload: UpdateCurriculumVersionPayload
  ): Promise<CurriculumVersionItem> {
    const response = await apiClient.put<ApiResponse<CurriculumVersionItem>>(
      API_ENDPOINTS.CURRICULA.VERSION_BY_ID(curriculumId, versionId),
      payload
    );
    return response.data.data;
  },

  async changeVersionStatus(
    curriculumId: string,
    versionId: string,
    status: CurriculumVersionStatus
  ): Promise<CurriculumVersionItem> {
    const response = await apiClient.patch<ApiResponse<CurriculumVersionItem>>(
      API_ENDPOINTS.CURRICULA.VERSION_STATUS(curriculumId, versionId),
      { status }
    );
    return response.data.data;
  },
};
