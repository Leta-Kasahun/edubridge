import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  SectionMasteryMatrixResponse,
  SingleStudentMasteryResponse,
  TopicMasteryHistoryItem,
  SectionMasteryQueryParams,
  RecalculateMasteryPayload,
} from "../types/mastery.types";

export const masteryService = {
  async getSectionMastery(
    sectionId: string,
    params?: SectionMasteryQueryParams
  ): Promise<SectionMasteryMatrixResponse> {
    const searchParams = new URLSearchParams();
    if (params?.subjectId && params.subjectId.trim()) {
      searchParams.append("subjectId", params.subjectId.trim());
    }
    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.MASTERY.SECTION_MATRIX(sectionId)}?${qs}`
      : API_ENDPOINTS.MASTERY.SECTION_MATRIX(sectionId);

    const response = await apiClient.get<ApiResponse<SectionMasteryMatrixResponse>>(endpoint);
    return response.data.data;
  },

  async getStudentMastery(
    studentId: string,
    subjectId?: string
  ): Promise<SingleStudentMasteryResponse> {
    const searchParams = new URLSearchParams();
    if (subjectId && subjectId.trim()) {
      searchParams.append("subjectId", subjectId.trim());
    }
    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.MASTERY.STUDENT(studentId)}?${qs}`
      : API_ENDPOINTS.MASTERY.STUDENT(studentId);

    const response = await apiClient.get<ApiResponse<SingleStudentMasteryResponse>>(endpoint);
    return response.data.data;
  },

  async getTopicMasteryHistory(
    studentId: string,
    topicId: string
  ): Promise<TopicMasteryHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<TopicMasteryHistoryItem[]>>(
      API_ENDPOINTS.MASTERY.TOPIC_HISTORY(studentId, topicId)
    );
    return response.data.data;
  },

  async recalculateMastery(payload: RecalculateMasteryPayload = {}): Promise<void> {
    await apiClient.post(API_ENDPOINTS.MASTERY.RECALCULATE, payload);
  },
};
