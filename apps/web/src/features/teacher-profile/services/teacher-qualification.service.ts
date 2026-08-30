import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  TeacherQualification,
  CreateQualificationPayload,
  UpdateQualificationPayload,
} from "../types/teacher-qualification.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const teacherQualificationService = {
  async getMyQualifications(): Promise<TeacherQualification[]> {
    const response = await apiClient.get<ApiResponse<TeacherQualification[]>>(
      API_ENDPOINTS.TEACHER_QUALIFICATIONS.ME
    );
    return response.data.data;
  },

  async getQualificationById(id: string): Promise<TeacherQualification> {
    const response = await apiClient.get<ApiResponse<TeacherQualification>>(
      API_ENDPOINTS.TEACHER_QUALIFICATIONS.BY_ID(id)
    );
    return response.data.data;
  },

  async createQualification(
    payload: CreateQualificationPayload
  ): Promise<TeacherQualification> {
    const response = await apiClient.post<ApiResponse<TeacherQualification>>(
      API_ENDPOINTS.TEACHER_QUALIFICATIONS.BASE,
      payload
    );
    return response.data.data;
  },

  async updateQualification(
    id: string,
    payload: UpdateQualificationPayload
  ): Promise<TeacherQualification> {
    const response = await apiClient.patch<ApiResponse<TeacherQualification>>(
      API_ENDPOINTS.TEACHER_QUALIFICATIONS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deleteQualification(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.TEACHER_QUALIFICATIONS.BY_ID(id));
  },
};
