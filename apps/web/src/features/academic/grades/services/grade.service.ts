import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  GradeItem,
  GradeDetailItem,
  CreateGradePayload,
  GradeFilters,
} from "../types/grade.types";

export const gradeService = {
  async getGrades(filters: GradeFilters = {}): Promise<readonly GradeItem[]> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.isActive !== undefined) {
      params.append("isActive", String(filters.isActive));
    }
    if (filters.category) {
      params.append("category", filters.category);
    }
    if (filters.academicYearId) {
      params.append("academicYearId", filters.academicYearId);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ACADEMIC_GRADES.BASE}?${queryString}`
      : API_ENDPOINTS.ACADEMIC_GRADES.BASE;

    const response = await apiClient.get<ApiResponse<GradeItem[]>>(endpoint);
    return response.data.data;
  },

  async getGradeById(
    id: string,
    academicYearId?: string
  ): Promise<GradeDetailItem> {
    const params = academicYearId ? `?academicYearId=${academicYearId}` : "";
    const response = await apiClient.get<ApiResponse<GradeDetailItem>>(
      `${API_ENDPOINTS.ACADEMIC_GRADES.BY_ID(id)}${params}`
    );
    return response.data.data;
  },

  async createGrade(payload: CreateGradePayload): Promise<GradeItem> {
    const response = await apiClient.post<ApiResponse<GradeItem>>(
      API_ENDPOINTS.ACADEMIC_GRADES.BASE,
      payload
    );
    return response.data.data;
  },

  async toggleActiveStatus(id: string): Promise<GradeItem> {
    const response = await apiClient.patch<ApiResponse<GradeItem>>(
      API_ENDPOINTS.ACADEMIC_GRADES.TOGGLE_STATUS(id)
    );
    return response.data.data;
  },
};
