import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse, PaginationMeta } from "@/shared/types";
import {
  CurriculumSubjectItem,
  CurriculumUnitItem,
  CurriculumTopicItem,
  LearningObjectiveItem,
  CreateCurriculumSubjectPayload,
  CreateUnitPayload,
  UpdateUnitPayload,
  CreateTopicPayload,
  UpdateTopicPayload,
  CreateObjectivePayload,
  UpdateObjectivePayload,
  ReorderStructurePayload,
  CurriculumTreeView,
} from "../types/structure.types";

export interface PaginatedStructureResponse<T> {
  readonly success: boolean;
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
}

export const structureService = {
  async getSubjects(versionId: string): Promise<readonly CurriculumSubjectItem[]> {
    const response = await apiClient.get<ApiResponse<readonly CurriculumSubjectItem[]>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.SUBJECTS(versionId)
    );
    return response.data.data;
  },

  async createSubject(
    payload: CreateCurriculumSubjectPayload
  ): Promise<CurriculumSubjectItem> {
    const response = await apiClient.post<ApiResponse<CurriculumSubjectItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.SUBJECT_BASE,
      payload
    );
    return response.data.data;
  },

  async deleteSubject(subjectId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.SUBJECT_BY_ID(subjectId)
    );
  },

  async getUnits(
    subjectId: string,
    params?: { search?: string; page?: number; limit?: number }
  ): Promise<readonly CurriculumUnitItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs
      ? `${API_ENDPOINTS.CURRICULUM_STRUCTURE.UNITS_BY_SUBJECT(subjectId)}?${qs}`
      : API_ENDPOINTS.CURRICULUM_STRUCTURE.UNITS_BY_SUBJECT(subjectId);

    const response = await apiClient.get<PaginatedStructureResponse<CurriculumUnitItem>>(url);
    return response.data.data;
  },

  async getUnitById(unitId: string): Promise<CurriculumUnitItem> {
    const response = await apiClient.get<ApiResponse<CurriculumUnitItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.UNIT_BY_ID(unitId)
    );
    return response.data.data;
  },

  async createUnit(payload: CreateUnitPayload): Promise<CurriculumUnitItem> {
    const response = await apiClient.post<ApiResponse<CurriculumUnitItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.UNIT_BASE,
      payload
    );
    return response.data.data;
  },

  async updateUnit(
    unitId: string,
    payload: UpdateUnitPayload
  ): Promise<CurriculumUnitItem> {
    const response = await apiClient.put<ApiResponse<CurriculumUnitItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.UNIT_BY_ID(unitId),
      payload
    );
    return response.data.data;
  },

  async deleteUnit(unitId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.UNIT_BY_ID(unitId)
    );
  },

  async getTopics(
    unitId: string,
    params?: { search?: string; page?: number; limit?: number }
  ): Promise<readonly CurriculumTopicItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs
      ? `${API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPICS_BY_UNIT(unitId)}?${qs}`
      : API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPICS_BY_UNIT(unitId);

    const response = await apiClient.get<PaginatedStructureResponse<CurriculumTopicItem>>(url);
    return response.data.data;
  },

  async getTopicById(topicId: string): Promise<CurriculumTopicItem> {
    const response = await apiClient.get<ApiResponse<CurriculumTopicItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPIC_BY_ID(topicId)
    );
    return response.data.data;
  },

  async createTopic(payload: CreateTopicPayload): Promise<CurriculumTopicItem> {
    const response = await apiClient.post<ApiResponse<CurriculumTopicItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPIC_BASE,
      payload
    );
    return response.data.data;
  },

  async updateTopic(
    topicId: string,
    payload: UpdateTopicPayload
  ): Promise<CurriculumTopicItem> {
    const response = await apiClient.put<ApiResponse<CurriculumTopicItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPIC_BY_ID(topicId),
      payload
    );
    return response.data.data;
  },

  async deleteTopic(topicId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.TOPIC_BY_ID(topicId)
    );
  },

  async getObjectives(
    topicId: string,
    params?: { search?: string; page?: number; limit?: number }
  ): Promise<readonly LearningObjectiveItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    const url = qs
      ? `${API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVES_BY_TOPIC(topicId)}?${qs}`
      : API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVES_BY_TOPIC(topicId);

    const response = await apiClient.get<PaginatedStructureResponse<LearningObjectiveItem>>(url);
    return response.data.data;
  },

  async getObjectiveById(objectiveId: string): Promise<LearningObjectiveItem> {
    const response = await apiClient.get<ApiResponse<LearningObjectiveItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVE_BY_ID(objectiveId)
    );
    return response.data.data;
  },

  async createObjective(payload: CreateObjectivePayload): Promise<LearningObjectiveItem> {
    const response = await apiClient.post<ApiResponse<LearningObjectiveItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVE_BASE,
      payload
    );
    return response.data.data;
  },

  async updateObjective(
    objectiveId: string,
    payload: UpdateObjectivePayload
  ): Promise<LearningObjectiveItem> {
    const response = await apiClient.put<ApiResponse<LearningObjectiveItem>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVE_BY_ID(objectiveId),
      payload
    );
    return response.data.data;
  },

  async deleteObjective(objectiveId: string): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.OBJECTIVE_BY_ID(objectiveId)
    );
  },

  async reorder(payload: ReorderStructurePayload): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.REORDER,
      payload
    );
  },

  async getTree(versionId: string): Promise<CurriculumTreeView> {
    const response = await apiClient.get<ApiResponse<CurriculumTreeView>>(
      API_ENDPOINTS.CURRICULUM_STRUCTURE.TREE(versionId)
    );
    return response.data.data;
  },
};
