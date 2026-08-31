import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  SectionRecord,
  SectionDetailRecord,
  CreateSectionInput,
  BulkCreateSectionsInput,
  UpdateSectionInput,
  SectionFilterParams,
} from "../types/section.types";
import { SectionStatusType } from "@/shared/constants/section.constants";

export const sectionService = {
  async getSections(filters: SectionFilterParams = {}): Promise<readonly SectionRecord[]> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.academicYearId) {
      params.append("academicYearId", filters.academicYearId);
    }
    if (filters.gradeId) {
      params.append("gradeId", filters.gradeId);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ACADEMIC_SECTIONS.BASE}?${queryString}`
      : API_ENDPOINTS.ACADEMIC_SECTIONS.BASE;

    const response = await apiClient.get<ApiResponse<SectionRecord[]>>(endpoint);
    return response.data.data;
  },

  async getSectionById(id: string): Promise<SectionDetailRecord> {
    const response = await apiClient.get<ApiResponse<SectionDetailRecord>>(
      API_ENDPOINTS.ACADEMIC_SECTIONS.BY_ID(id)
    );
    return response.data.data;
  },

  async createSection(payload: CreateSectionInput): Promise<SectionRecord> {
    const response = await apiClient.post<ApiResponse<SectionRecord>>(
      API_ENDPOINTS.ACADEMIC_SECTIONS.BASE,
      payload
    );
    return response.data.data;
  },

  async bulkCreateSections(
    payload: BulkCreateSectionsInput
  ): Promise<{ readonly createdCount: number; readonly totalRequested: number }> {
    const response = await apiClient.post<
      ApiResponse<{ readonly createdCount: number; readonly totalRequested: number }>
    >(API_ENDPOINTS.ACADEMIC_SECTIONS.BULK, payload);
    return response.data.data;
  },

  async updateSection(
    id: string,
    payload: UpdateSectionInput
  ): Promise<SectionRecord> {
    const response = await apiClient.patch<ApiResponse<SectionRecord>>(
      API_ENDPOINTS.ACADEMIC_SECTIONS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async updateSectionStatus(
    id: string,
    status: SectionStatusType
  ): Promise<SectionRecord> {
    const response = await apiClient.patch<ApiResponse<SectionRecord>>(
      API_ENDPOINTS.ACADEMIC_SECTIONS.UPDATE_STATUS(id),
      { status }
    );
    return response.data.data;
  },

  async deleteSection(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.ACADEMIC_SECTIONS.BY_ID(id)
    );
  },
};
