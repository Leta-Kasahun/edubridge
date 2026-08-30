import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  StudentProfileDetail,
  CompleteStudentProfilePayload,
  UpdateStudentProfilePayload,
} from "../types/student-profile.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const studentProfileService = {
  async getMyProfile(): Promise<StudentProfileDetail> {
    const response = await apiClient.get<ApiResponse<StudentProfileDetail>>(
      API_ENDPOINTS.STUDENT_PROFILE.ME
    );
    return response.data.data;
  },

  async getProfileById(id: string): Promise<StudentProfileDetail> {
    const response = await apiClient.get<ApiResponse<StudentProfileDetail>>(
      API_ENDPOINTS.STUDENT_PROFILE.BY_ID(id)
    );
    return response.data.data;
  },

  async completeProfile(
    payload: CompleteStudentProfilePayload
  ): Promise<StudentProfileDetail> {
    const response = await apiClient.post<ApiResponse<StudentProfileDetail>>(
      API_ENDPOINTS.STUDENT_PROFILE.COMPLETE,
      payload
    );
    return response.data.data;
  },

  async updateMyProfile(
    payload: UpdateStudentProfilePayload
  ): Promise<StudentProfileDetail> {
    const response = await apiClient.patch<ApiResponse<StudentProfileDetail>>(
      API_ENDPOINTS.STUDENT_PROFILE.ME,
      payload
    );
    return response.data.data;
  },
};
