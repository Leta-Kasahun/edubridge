import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
  StudentResultsResponse,
  SubmitQuestionFeedbackPayload,
} from "../types/evaluation.types";

export const evaluationService = {
  async getAttemptResult(
    assessmentId: string,
    attemptId: string
  ): Promise<AssessmentAttemptResult> {
    const response = await apiClient.get<ApiResponse<AssessmentAttemptResult>>(
      API_ENDPOINTS.ASSESSMENTS.ATTEMPT_RESULT(assessmentId, attemptId)
    );
    return response.data.data;
  },

  async manualGrade(
    assessmentId: string,
    attemptId: string,
    payload: ManualGradeAttemptPayload
  ): Promise<AssessmentAttemptResult> {
    const response = await apiClient.put<ApiResponse<AssessmentAttemptResult>>(
      API_ENDPOINTS.ASSESSMENTS.MANUAL_GRADE(assessmentId, attemptId),
      payload
    );
    return response.data.data;
  },

  async submitQuestionFeedback(
    assessmentId: string,
    payload: SubmitQuestionFeedbackPayload
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.ASSESSMENTS.QUESTION_FEEDBACK(assessmentId),
      payload
    );
    return response.data.data;
  },

  async listStudentResults(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<StudentResultsResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.ASSESSMENTS.STUDENT_RESULTS}?${qs}`
      : API_ENDPOINTS.ASSESSMENTS.STUDENT_RESULTS;

    const response = await apiClient.get<ApiResponse<StudentResultsResponse>>(endpoint);
    return response.data.data;
  },
};
