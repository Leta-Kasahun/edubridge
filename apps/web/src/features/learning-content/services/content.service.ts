import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  LearningContentListItem,
  LearningContentDetailItem,
  ContentVersionItem,
  ContentAttachmentItem,
  ContentFilters,
  CreateLearningContentDto,
  UpdateLearningContentDto,
  UpdateContentMappingsDto,
  CreateContentVersionDto,
  PaginatedContentResponse,
} from "../types/content.types";

export const contentService = {
  async getContentList(
    filters: ContentFilters = {}
  ): Promise<PaginatedContentResponse> {
    const params = new URLSearchParams();
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.type) {
      params.append("type", filters.type);
    }
    if (filters.scope) {
      params.append("scope", filters.scope);
    }
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.source) {
      params.append("source", filters.source);
    }
    if (filters.subjectId) {
      params.append("subjectId", filters.subjectId);
    }
    if (filters.gradeId) {
      params.append("gradeId", filters.gradeId);
    }
    if (filters.unitId) {
      params.append("unitId", filters.unitId);
    }
    if (filters.topicId) {
      params.append("topicId", filters.topicId);
    }
    if (filters.objectiveId) {
      params.append("objectiveId", filters.objectiveId);
    }
    if (filters.curriculumVersionId) {
      params.append("curriculumVersionId", filters.curriculumVersionId);
    }
    if (filters.academicYearId) {
      params.append("academicYearId", filters.academicYearId);
    }
    if (filters.targetGradeLevel !== undefined) {
      params.append("targetGradeLevel", String(filters.targetGradeLevel));
    }
    if (filters.page) {
      params.append("page", String(filters.page));
    }
    if (filters.limit) {
      params.append("limit", String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.LEARNING_CONTENT.BASE}?${queryString}`
      : API_ENDPOINTS.LEARNING_CONTENT.BASE;

    const response = await apiClient.get<PaginatedContentResponse>(endpoint);
    return response.data;
  },

  async getContentById(id: string): Promise<LearningContentDetailItem> {
    const response = await apiClient.get<ApiResponse<LearningContentDetailItem>>(
      API_ENDPOINTS.LEARNING_CONTENT.BY_ID(id)
    );
    return response.data.data;
  },

  async createContent(
    payload: CreateLearningContentDto
  ): Promise<LearningContentDetailItem> {
    const response = await apiClient.post<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.BASE, payload);
    return response.data.data;
  },

  async updateContentMetadata(
    id: string,
    payload: UpdateLearningContentDto
  ): Promise<LearningContentDetailItem> {
    const response = await apiClient.patch<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.BY_ID(id), payload);
    return response.data.data;
  },

  async updateContentMappings(
    id: string,
    payload: UpdateContentMappingsDto
  ): Promise<LearningContentDetailItem> {
    const response = await apiClient.put<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.MAPPINGS(id), payload);
    return response.data.data;
  },

  async saveNewVersion(
    id: string,
    payload: CreateContentVersionDto
  ): Promise<ContentVersionItem> {
    const response = await apiClient.post<ApiResponse<ContentVersionItem>>(
      API_ENDPOINTS.LEARNING_CONTENT.VERSIONS(id),
      payload
    );
    return response.data.data;
  },

  async getVersions(id: string): Promise<readonly ContentVersionItem[]> {
    const response = await apiClient.get<
      ApiResponse<readonly ContentVersionItem[]>
    >(API_ENDPOINTS.LEARNING_CONTENT.VERSIONS(id));
    return response.data.data;
  },

  async getVersionByNumber(
    id: string,
    versionNumber: number
  ): Promise<ContentVersionItem> {
    const response = await apiClient.get<ApiResponse<ContentVersionItem>>(
      API_ENDPOINTS.LEARNING_CONTENT.VERSION_BY_NUMBER(id, versionNumber)
    );
    return response.data.data;
  },

  async submitContent(id: string): Promise<LearningContentDetailItem> {
    const response = await apiClient.post<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.SUBMIT(id));
    return response.data.data;
  },

  async approveContent(id: string): Promise<LearningContentDetailItem> {
    const response = await apiClient.post<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.APPROVE(id));
    return response.data.data;
  },

  async publishContent(id: string): Promise<LearningContentDetailItem> {
    const response = await apiClient.post<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.PUBLISH(id));
    return response.data.data;
  },

  async archiveContent(id: string): Promise<LearningContentDetailItem> {
    const response = await apiClient.post<
      ApiResponse<LearningContentDetailItem>
    >(API_ENDPOINTS.LEARNING_CONTENT.ARCHIVE(id));
    return response.data.data;
  },

  async deleteContent(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.LEARNING_CONTENT.BY_ID(id)
    );
    return response.data;
  },

  async uploadAttachment(
    id: string,
    file: File
  ): Promise<ContentAttachmentItem> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<ContentAttachmentItem>>(
      API_ENDPOINTS.LEARNING_CONTENT.ATTACHMENTS(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  async deleteAttachment(
    id: string,
    attachmentId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      API_ENDPOINTS.LEARNING_CONTENT.ATTACHMENT_BY_ID(id, attachmentId)
    );
    return response.data;
  },
};
