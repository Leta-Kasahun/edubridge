import { apiClient, getAccessToken, getTenantId } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { ApiResponse, PaginatedResponse } from "@/shared/types";
import type {
  GenerateQuestionsDto,
  GenerateQuestionsResponse,
  GenerateContentDto,
  GenerateContentResponse,
  AiJobItem,
} from "../types/ai.types";

export const aiService = {
  async generateQuestions(
    dto: GenerateQuestionsDto
  ): Promise<GenerateQuestionsResponse> {
    const response = await apiClient.post<ApiResponse<GenerateQuestionsResponse>>(
      API_ENDPOINTS.AI.GENERATE_QUESTIONS,
      dto
    );
    return response.data.data;
  },

  async generateContent(
    dto: GenerateContentDto
  ): Promise<GenerateContentResponse> {
    const response = await apiClient.post<ApiResponse<GenerateContentResponse>>(
      API_ENDPOINTS.AI.GENERATE_CONTENT,
      dto
    );
    return response.data.data;
  },

  async getJob(id: string): Promise<AiJobItem> {
    const response = await apiClient.get<ApiResponse<AiJobItem>>(
      API_ENDPOINTS.AI.JOB_BY_ID(id)
    );
    return response.data.data;
  },

  async listJobs(
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<AiJobItem>> {
    const response = await apiClient.get<
      ApiResponse<AiJobItem[]> & { pagination: { page: number; limit: number; total: number; totalPages: number } }
    >(`${API_ENDPOINTS.AI.JOBS}?page=${page}&limit=${limit}`);

    return {
      items: response.data.data,
      meta: {
        page: response.data.pagination?.page ?? page,
        limit: response.data.pagination?.limit ?? limit,
        total: response.data.pagination?.total ?? response.data.data.length,
        totalPages: response.data.pagination?.totalPages ?? 1,
      },
    };
  },

  async streamExplanation(
    questionId: string,
    options: {
      readonly studentAnswer?: string;
      readonly signal?: AbortSignal;
      readonly onToken: (token: string) => void;
      readonly onError?: (error: string) => void;
      readonly onComplete?: () => void;
    }
  ): Promise<void> {
    const queryString = options.studentAnswer
      ? `?studentAnswer=${encodeURIComponent(options.studentAnswer)}`
      : "";
    const url = `${env.apiUrl}${API_ENDPOINTS.AI.EXPLANATION_STREAM(questionId)}${queryString}`;

    const token = getAccessToken();
    const tenantId = getTenantId();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
        },
        signal: options.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to stream explanation (HTTP ${response.status})`);
      }

      if (!response.body) {
        throw new Error("Readable stream is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const message of messages) {
          const trimmed = message.trim();
          if (!trimmed.startsWith("data:")) continue;

          const dataContent = trimmed.replace(/^data:\s*/, "");
          if (dataContent === "[DONE]") {
            options.onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(dataContent) as { text?: string; error?: string };
            if (parsed.error) {
              options.onError?.(parsed.error);
              return;
            }
            if (parsed.text) {
              options.onToken(parsed.text);
            }
          } catch {
            // Non-JSON line or partial payload
          }
        }
      }

      options.onComplete?.();
    } catch (err) {
      if (options.signal?.aborted) return;
      const message = err instanceof Error ? err.message : "Explanation streaming failed";
      options.onError?.(message);
    }
  },

  async streamTutor(
    message: string,
    options: {
      readonly topicId?: string;
      readonly signal?: AbortSignal;
      readonly onToken: (token: string) => void;
      readonly onError?: (error: string) => void;
      readonly onComplete?: () => void;
    }
  ): Promise<void> {
    const url = `${env.apiUrl}${API_ENDPOINTS.AI.TUTOR_STREAM}`;
    const token = getAccessToken();
    const tenantId = getTenantId();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
        },
        body: JSON.stringify({ message, topicId: options.topicId }),
        signal: options.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to stream tutor response (HTTP ${response.status})`);
      }

      if (!response.body) {
        throw new Error("Readable stream is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? "";

        for (const msg of messages) {
          const trimmed = msg.trim();
          if (!trimmed.startsWith("data:")) continue;

          const dataContent = trimmed.replace(/^data:\s*/, "");
          if (dataContent === "[DONE]") {
            options.onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(dataContent) as { text?: string; error?: string };
            if (parsed.error) {
              options.onError?.(parsed.error);
              return;
            }
            if (parsed.text) {
              options.onToken(parsed.text);
            }
          } catch {
            // Partial payload or non-JSON
          }
        }
      }

      options.onComplete?.();
    } catch (err) {
      if (options.signal?.aborted) return;
      const errMsg = err instanceof Error ? err.message : "Tutor streaming failed";
      options.onError?.(errMsg);
    }
  },
};
