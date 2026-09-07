import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  QuestionBankItem,
  QuestionBankDetailItem,
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  QuestionBankFilters,
  QuestionListItem,
  QuestionDetailItem,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilters,
  QuestionUploadResponse,
  ConfirmUploadDto,
  PaginatedResponse,
} from "../types/question-bank.types";

export const questionBankService = {
  async getQuestionBanks(
    filters: QuestionBankFilters = {}
  ): Promise<PaginatedResponse<QuestionBankItem>> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.subjectId) {
      params.append("subjectId", filters.subjectId);
    }
    if (filters.gradeId) {
      params.append("gradeId", filters.gradeId);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.examContextId) {
      params.append("examContextId", filters.examContextId);
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.QUESTION_BANKS.BASE}?${queryString}`
      : API_ENDPOINTS.QUESTION_BANKS.BASE;

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<QuestionBankItem>> | { success: boolean; data: readonly QuestionBankItem[]; pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }
    >(endpoint);
    const raw = response.data;
    if ("items" in raw.data && Array.isArray(raw.data.items)) {
      return raw.data as PaginatedResponse<QuestionBankItem>;
    }
    if (Array.isArray(raw.data)) {
      const p = (raw as { pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }).pagination || {};
      const page = p.page ?? 1;
      const totalPages = p.totalPages ?? 1;
      return {
        items: raw.data as readonly QuestionBankItem[],
        meta: {
          total: p.total ?? raw.data.length,
          page,
          limit: p.limit ?? 20,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }
    return {
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  async getQuestionBankById(id: string): Promise<QuestionBankDetailItem> {
    const response = await apiClient.get<ApiResponse<QuestionBankDetailItem>>(
      API_ENDPOINTS.QUESTION_BANKS.BY_ID(id)
    );
    return response.data.data;
  },

  async createQuestionBank(
    payload: CreateQuestionBankDto
  ): Promise<QuestionBankItem> {
    const response = await apiClient.post<ApiResponse<QuestionBankItem>>(
      API_ENDPOINTS.QUESTION_BANKS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateQuestionBank(
    id: string,
    payload: UpdateQuestionBankDto
  ): Promise<QuestionBankItem> {
    const response = await apiClient.patch<ApiResponse<QuestionBankItem>>(
      API_ENDPOINTS.QUESTION_BANKS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteQuestionBank(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.QUESTION_BANKS.BY_ID(id)
    );
    return response.data;
  },

  async getQuestions(
    bankId: string,
    filters: QuestionFilters = {}
  ): Promise<PaginatedResponse<QuestionListItem>> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.type) {
      params.append("type", filters.type);
    }
    if (filters.difficulty) {
      params.append("difficulty", filters.difficulty);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.topicId) {
      params.append("topicId", filters.topicId);
    }
    if (filters.objectiveId) {
      params.append("objectiveId", filters.objectiveId);
    }
    if (filters.examContextId) {
      params.append("examContextId", filters.examContextId);
    }
    if (filters.examYear) {
      params.append("examYear", String(filters.examYear));
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.QUESTION_BANKS.QUESTIONS(bankId)}?${queryString}`
      : API_ENDPOINTS.QUESTION_BANKS.QUESTIONS(bankId);

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<QuestionListItem>> | { success: boolean; data: readonly QuestionListItem[]; pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }
    >(endpoint);
    const raw = response.data;
    if ("items" in raw.data && Array.isArray(raw.data.items)) {
      return raw.data as PaginatedResponse<QuestionListItem>;
    }
    if (Array.isArray(raw.data)) {
      const p = (raw as { pagination?: { total?: number; page?: number; limit?: number; totalPages?: number } }).pagination || {};
      const page = p.page ?? 1;
      const totalPages = p.totalPages ?? 1;
      return {
        items: raw.data as readonly QuestionListItem[],
        meta: {
          total: p.total ?? raw.data.length,
          page,
          limit: p.limit ?? 20,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }
    return {
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  async getQuestionById(id: string): Promise<QuestionDetailItem> {
    const response = await apiClient.get<ApiResponse<QuestionDetailItem>>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTION_BY_ID(id)
    );
    return response.data.data;
  },

  async createQuestion(
    bankId: string,
    payload: CreateQuestionDto
  ): Promise<QuestionDetailItem> {
    const response = await apiClient.post<ApiResponse<QuestionDetailItem>>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTIONS(bankId),
      payload
    );
    return response.data.data;
  },

  async createBatchQuestions(
    bankId: string,
    questions: readonly CreateQuestionDto[]
  ): Promise<readonly QuestionListItem[]> {
    const response = await apiClient.post<ApiResponse<readonly QuestionListItem[]>>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTIONS_BATCH(bankId),
      { questions }
    );
    return response.data.data;
  },

  async updateQuestion(
    id: string,
    payload: UpdateQuestionDto
  ): Promise<QuestionDetailItem> {
    const response = await apiClient.patch<ApiResponse<QuestionDetailItem>>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTION_BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async publishQuestion(id: string): Promise<QuestionDetailItem> {
    const response = await apiClient.post<ApiResponse<QuestionDetailItem>>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTION_PUBLISH(id)
    );
    return response.data.data;
  },

  async deleteQuestion(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.QUESTION_BANKS.QUESTION_BY_ID(id)
    );
    return response.data;
  },

  async uploadQuestionFile(
    bankId: string,
    file: File
  ): Promise<QuestionUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<QuestionUploadResponse>>(
      API_ENDPOINTS.QUESTION_BANKS.UPLOAD(bankId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  async getUploadPreview(uploadId: string): Promise<QuestionUploadResponse> {
    const response = await apiClient.get<ApiResponse<QuestionUploadResponse>>(
      API_ENDPOINTS.QUESTION_BANKS.UPLOAD_PREVIEW(uploadId)
    );
    return response.data.data;
  },

  async confirmUpload(
    bankId: string,
    uploadId: string,
    payload: ConfirmUploadDto
  ): Promise<{ importedCount: number; questions: readonly QuestionListItem[] }> {
    const response = await apiClient.post<
      ApiResponse<{ importedCount: number; questions: readonly QuestionListItem[] }>
    >(API_ENDPOINTS.QUESTION_BANKS.UPLOAD_CONFIRM(bankId, uploadId), payload);
    return response.data.data;
  },
};
