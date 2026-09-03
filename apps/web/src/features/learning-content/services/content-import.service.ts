import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  ContentImportPreview,
  ContentImportCommitPayload,
  ContentImportCommitResult,
} from "../types/import.types";

export const contentImportService = {
  async previewImport(payload: {
    csvContent: string;
    curriculumVersionId?: string;
  }): Promise<ContentImportPreview> {
    const response = await apiClient.post<ApiResponse<ContentImportPreview>>(
      API_ENDPOINTS.LEARNING_CONTENT_IMPORT.PREVIEW,
      payload
    );
    return response.data.data;
  },

  async commitImport(
    payload: ContentImportCommitPayload
  ): Promise<ContentImportCommitResult> {
    const response = await apiClient.post<
      ApiResponse<ContentImportCommitResult>
    >(API_ENDPOINTS.LEARNING_CONTENT_IMPORT.COMMIT, payload);
    return response.data.data;
  },

  async downloadTemplate(): Promise<string> {
    const response = await apiClient.get<string>(
      API_ENDPOINTS.LEARNING_CONTENT_IMPORT.TEMPLATE,
      {
        responseType: "text",
      }
    );
    return response.data;
  },
};
