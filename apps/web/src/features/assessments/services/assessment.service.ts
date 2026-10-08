import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  AssessmentItem,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
  AssessmentQueryParams,
  AssignAssessmentPayload,
  AssessmentAssignmentItem,
  StudentInProgressAssessmentItem,
} from "../types/assessment.types";

export interface PaginatedAssessmentsResponse {
  items: AssessmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const assessmentService = {
  async getAssessments(
    params: AssessmentQueryParams = {}
  ): Promise<PaginatedAssessmentsResponse> {
    const searchParams = new URLSearchParams();
    if (params.search?.trim()) searchParams.append("search", params.search.trim());
    if (params.type) searchParams.append("type", params.type);
    if (params.status) searchParams.append("status", params.status);
    if (params.gradingMode) searchParams.append("gradingMode", params.gradingMode);
    if (params.examContextId) searchParams.append("examContextId", params.examContextId);
    if (params.createdById) searchParams.append("createdById", params.createdById);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.ASSESSMENTS.BASE}?${qs}`
      : API_ENDPOINTS.ASSESSMENTS.BASE;

    const response = await apiClient.get<
      ApiResponse<PaginatedAssessmentsResponse> | PaginatedAssessmentsResponse
    >(endpoint);

    const raw = response.data;
    if ("data" in raw && raw.data && "items" in raw.data) {
      return raw.data as PaginatedAssessmentsResponse;
    }
    if ("items" in raw) {
      return raw as PaginatedAssessmentsResponse;
    }

    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  },

  async getAssessmentById(id: string): Promise<AssessmentItem> {
    const response = await apiClient.get<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.BY_ID(id)
    );
    return response.data.data;
  },

  async createAssessment(payload: CreateAssessmentPayload): Promise<AssessmentItem> {
    const response = await apiClient.post<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateAssessment(
    id: string,
    payload: UpdateAssessmentPayload
  ): Promise<AssessmentItem> {
    const response = await apiClient.put<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async setQuestions(
    id: string,
    questions: Array<{ questionVersionId: string; orderIndex: number; points: number }>
  ): Promise<AssessmentItem> {
    const response = await apiClient.put<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.QUESTIONS(id),
      { questions }
    );
    return response.data.data;
  },

  async assignToSections(
    id: string,
    payload: AssignAssessmentPayload
  ): Promise<AssessmentAssignmentItem[]> {
    const response = await apiClient.post<ApiResponse<AssessmentAssignmentItem[]>>(
      API_ENDPOINTS.ASSESSMENTS.ASSIGN(id),
      payload
    );
    return response.data.data;
  },

  async publishAssessment(id: string): Promise<AssessmentItem> {
    const response = await apiClient.post<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.PUBLISH(id),
      {}
    );
    return response.data.data;
  },

  async unarchiveAssessment(id: string): Promise<AssessmentItem> {
    const response = await apiClient.post<ApiResponse<AssessmentItem>>(
      API_ENDPOINTS.ASSESSMENTS.UNARCHIVE(id),
      {}
    );
    return response.data.data;
  },

  async archiveAssessment(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ASSESSMENTS.BY_ID(id));
  },

  async getStudentInProgressAssessments(
    limit: number = 6
  ): Promise<StudentInProgressAssessmentItem[]> {
    const response = await apiClient.get<ApiResponse<StudentInProgressAssessmentItem[]>>(
      `${API_ENDPOINTS.ASSESSMENTS.STUDENT_IN_PROGRESS}?limit=${limit}`
    );
    return response.data.data ?? [];
  },
};
