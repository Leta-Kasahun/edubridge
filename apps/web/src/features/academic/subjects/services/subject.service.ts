import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  SubjectItem,
  SubjectDetailItem,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  AssignGradesPayload,
  SubjectFilters,
} from "../types/subject.types";

export const subjectService = {
  async getSubjects(filters: SubjectFilters = {}): Promise<readonly SubjectItem[]> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.isActive !== undefined) {
      params.append("isActive", String(filters.isActive));
    }
    if (filters.gradeLevel !== undefined) {
      params.append("gradeLevel", String(filters.gradeLevel));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.ACADEMIC_SUBJECTS.BASE}?${queryString}`
      : API_ENDPOINTS.ACADEMIC_SUBJECTS.BASE;

    const response = await apiClient.get<ApiResponse<SubjectItem[]>>(endpoint);
    return response.data.data;
  },

  async getSubjectById(id: string): Promise<SubjectDetailItem> {
    const response = await apiClient.get<ApiResponse<SubjectDetailItem>>(
      API_ENDPOINTS.ACADEMIC_SUBJECTS.BY_ID(id)
    );
    return response.data.data;
  },

  async createSubject(payload: CreateSubjectPayload): Promise<SubjectItem> {
    const response = await apiClient.post<ApiResponse<SubjectItem>>(
      API_ENDPOINTS.ACADEMIC_SUBJECTS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateSubject(id: string, payload: UpdateSubjectPayload): Promise<SubjectItem> {
    const response = await apiClient.put<ApiResponse<SubjectItem>>(
      API_ENDPOINTS.ACADEMIC_SUBJECTS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async toggleSubjectStatus(id: string): Promise<SubjectItem> {
    const response = await apiClient.post<ApiResponse<SubjectItem>>(
      API_ENDPOINTS.ACADEMIC_SUBJECTS.TOGGLE_STATUS(id)
    );
    return response.data.data;
  },

  async assignGrades(id: string, payload: AssignGradesPayload): Promise<SubjectDetailItem> {
    const response = await apiClient.post<ApiResponse<SubjectDetailItem>>(
      API_ENDPOINTS.ACADEMIC_SUBJECTS.ASSIGN_GRADES(id),
      payload
    );
    return response.data.data;
  },
};
