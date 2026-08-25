import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  TeacherProfileDetail,
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
} from "../types/teacher-profile.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const teacherProfileService = {
  async getMyProfile(): Promise<TeacherProfileDetail> {
    const response = await apiClient.get<ApiResponse<TeacherProfileDetail>>(
      API_ENDPOINTS.TEACHER_PROFILE.ME
    );
    return response.data.data;
  },

  async getProfileById(id: string): Promise<TeacherProfileDetail> {
    const response = await apiClient.get<ApiResponse<TeacherProfileDetail>>(
      API_ENDPOINTS.TEACHER_PROFILE.BY_ID(id)
    );
    return response.data.data;
  },

  async completeProfile(
    payload: CompleteTeacherProfilePayload
  ): Promise<TeacherProfileDetail> {
    const response = await apiClient.post<ApiResponse<TeacherProfileDetail>>(
      API_ENDPOINTS.TEACHER_PROFILE.COMPLETE,
      payload
    );
    return response.data.data;
  },

  async updateMyProfile(
    payload: UpdateTeacherProfilePayload
  ): Promise<TeacherProfileDetail> {
    const response = await apiClient.patch<ApiResponse<TeacherProfileDetail>>(
      API_ENDPOINTS.TEACHER_PROFILE.ME,
      payload
    );
    return response.data.data;
  },
};
