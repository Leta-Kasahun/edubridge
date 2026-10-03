import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  StudentActiveAttemptSession,
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
} from "../types/assessment.types";

export interface PaginatedAttemptsResponse {
  items: AssessmentAttemptResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const attemptService = {
  async startAttempt(
    assessmentId: string,
    assignmentId?: string
  ): Promise<StudentActiveAttemptSession> {
    const payload = assignmentId && assignmentId.trim() && assignmentId !== assessmentId
      ? { assignmentId }
      : {};
    const response = await apiClient.post<ApiResponse<StudentActiveAttemptSession>>(
      API_ENDPOINTS.ASSESSMENTS.START_ATTEMPT(assessmentId),
      payload
    );
    return response.data.data;
  },

  async saveAnswer(
    assessmentId: string,
    attemptId: string,
    questionVersionId: string,
    answerResponse: unknown
  ): Promise<void> {
    await apiClient.put(
      API_ENDPOINTS.ASSESSMENTS.SAVE_ANSWER(assessmentId, attemptId),
      {
        questionVersionId,
        response: answerResponse,
      }
    );
  },

  async batchSaveAnswers(
    assessmentId: string,
    attemptId: string,
    answers: Array<{ questionVersionId: string; response: unknown }>
  ): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.ASSESSMENTS.BATCH_SAVE_ANSWERS(assessmentId, attemptId),
      { answers }
    );
  },

  async submitAttempt(
    assessmentId: string,
    attemptId: string,
    answers?: Array<{ questionVersionId: string; response: unknown }>
  ): Promise<AssessmentAttemptResult> {
    const response = await apiClient.post<ApiResponse<AssessmentAttemptResult>>(
      API_ENDPOINTS.ASSESSMENTS.SUBMIT_ATTEMPT(assessmentId, attemptId),
      { answers }
    );
    return response.data.data;
  },

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

  async listAttempts(
    assessmentId: string,
    params: {
      studentId?: string;
      sectionId?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginatedAttemptsResponse> {
    const searchParams = new URLSearchParams();
    if (params.studentId) searchParams.append("studentId", params.studentId);
    if (params.sectionId) searchParams.append("sectionId", params.sectionId);
    if (params.status) searchParams.append("status", params.status);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));

    const qs = searchParams.toString();
    const endpoint = qs
      ? `${API_ENDPOINTS.ASSESSMENTS.ATTEMPTS(assessmentId)}?${qs}`
      : API_ENDPOINTS.ASSESSMENTS.ATTEMPTS(assessmentId);

    const response = await apiClient.get<
      ApiResponse<PaginatedAttemptsResponse> | PaginatedAttemptsResponse
    >(endpoint);

    const raw = response.data;
    if ("data" in raw && raw.data && "items" in raw.data) {
      return raw.data as PaginatedAttemptsResponse;
    }
    if ("items" in raw) {
      return raw as PaginatedAttemptsResponse;
    }

    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  },

  async submitQuestionFeedback(
    assessmentId: string,
    payload: {
      questionVersionId: string;
      message: string;
      category?: "CLARIFICATION" | "TYPO_REPORT" | "CONTENT_ISSUE" | "GENERAL";
    }
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.ASSESSMENTS.QUESTION_FEEDBACK(assessmentId),
      payload
    );
    return response.data.data;
  },
};
