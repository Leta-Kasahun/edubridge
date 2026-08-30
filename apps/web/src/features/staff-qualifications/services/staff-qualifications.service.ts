import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  StaffDirectoryFilters,
  StaffDirectoryResponse,
  StaffDirectoryItem,
} from "../types/staff-qualifications.types";

export const staffQualificationsService = {
  async getDirectory(
    filters: StaffDirectoryFilters = {}
  ): Promise<StaffDirectoryResponse> {
    const params = new URLSearchParams();

    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.level) {
      params.append("level", filters.level);
    }
    if (filters.hasCertificate !== undefined) {
      params.append("hasCertificate", String(filters.hasCertificate));
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
      ? `${API_ENDPOINTS.STAFF_QUALIFICATIONS.BASE}?${queryString}`
      : API_ENDPOINTS.STAFF_QUALIFICATIONS.BASE;

    const response = await apiClient.get<
      ApiResponse<StaffDirectoryItem[]> & {
        pagination: StaffDirectoryResponse["pagination"];
      }
    >(endpoint);

    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        total: response.data.data.length,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages: 1,
      },
    };
  },
};
