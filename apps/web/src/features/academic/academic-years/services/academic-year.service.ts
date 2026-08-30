import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import { DEFAULT_ACADEMIC_YEARS_PAGE_LIMIT } from "@/shared/constants";
import {
  AcademicYearItem,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
  AcademicYearFilters,
  PaginatedAcademicYearsResponse,
} from "../types/academic-year.types";

export const academicYearService = {
  async getAcademicYears(
    filters: AcademicYearFilters = {}
  ): Promise<PaginatedAcademicYearsResponse> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ACADEMIC_YEARS.BASE}?${queryString}`
      : API_ENDPOINTS.ACADEMIC_YEARS.BASE;

    const response = await apiClient.get<
      ApiResponse<AcademicYearItem[]> & {
        pagination: PaginatedAcademicYearsResponse["pagination"];
      }
    >(endpoint);

    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        total: response.data.data.length,
        page: filters.page || 1,
        limit: filters.limit || DEFAULT_ACADEMIC_YEARS_PAGE_LIMIT,
        totalPages: 1,
      },
    };
  },

  async getActiveAcademicYear(): Promise<AcademicYearItem | null> {
    const response = await apiClient.get<ApiResponse<AcademicYearItem | null>>(
      API_ENDPOINTS.ACADEMIC_YEARS.ACTIVE
    );
    return response.data.data;
  },

  async getAcademicYearById(id: string): Promise<AcademicYearItem> {
    const response = await apiClient.get<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.BY_ID(id)
    );
    return response.data.data;
  },

  async createAcademicYear(
    payload: CreateAcademicYearPayload
  ): Promise<AcademicYearItem> {
    const response = await apiClient.post<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateAcademicYear(
    id: string,
    payload: UpdateAcademicYearPayload
  ): Promise<AcademicYearItem> {
    const response = await apiClient.put<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async setActiveAcademicYear(id: string): Promise<AcademicYearItem> {
    const response = await apiClient.post<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.SET_ACTIVE(id)
    );
    return response.data.data;
  },

  async archiveAcademicYear(id: string): Promise<AcademicYearItem> {
    const response = await apiClient.post<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.ARCHIVE(id)
    );
    return response.data.data;
  },

  async restoreAcademicYear(id: string): Promise<AcademicYearItem> {
    const response = await apiClient.post<ApiResponse<AcademicYearItem>>(
      API_ENDPOINTS.ACADEMIC_YEARS.RESTORE(id)
    );
    return response.data.data;
  },
};
