import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  TeacherExperience,
  CreateExperiencePayload,
  UpdateExperiencePayload,
} from "../types/teacher-experience.types";

export const teacherExperienceService = {
  async getMyExperiences(): Promise<TeacherExperience[]> {
    const response = await apiClient.get<ApiResponse<TeacherExperience[]>>(
      API_ENDPOINTS.TEACHER_EXPERIENCES.ME
    );
    return response.data.data;
  },

  async getExperienceById(id: string): Promise<TeacherExperience> {
    const response = await apiClient.get<ApiResponse<TeacherExperience>>(
      API_ENDPOINTS.TEACHER_EXPERIENCES.BY_ID(id)
    );
    return response.data.data;
  },

  async createExperience(
    payload: CreateExperiencePayload
  ): Promise<TeacherExperience> {
    const response = await apiClient.post<ApiResponse<TeacherExperience>>(
      API_ENDPOINTS.TEACHER_EXPERIENCES.BASE,
      payload
    );
    return response.data.data;
  },

  async updateExperience(
    id: string,
    payload: UpdateExperiencePayload
  ): Promise<TeacherExperience> {
    const response = await apiClient.patch<ApiResponse<TeacherExperience>>(
      API_ENDPOINTS.TEACHER_EXPERIENCES.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteExperience(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TEACHER_EXPERIENCES.BY_ID(id));
  },
};
