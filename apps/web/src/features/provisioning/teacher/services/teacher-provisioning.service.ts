import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  SingleTeacherProvisionInvitePayload,
  SingleTeacherProvisionDirectPayload,
  SingleTeacherProvisionPayload,
  BulkTeacherProvisionPayload,
  BulkTeacherCsvPayload,
  TeacherProvisionResult,
  TeacherBulkProvisionResult,
  TeacherRecord,
  TeacherQueryFilters,
  TeacherPaginatedResponse,
  UpdateTeacherPayload,
} from "../types/teacher-provisioning.types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export const teacherProvisioningService = {
  async inviteTeacher(
    payload: SingleTeacherProvisionInvitePayload
  ): Promise<TeacherProvisionResult> {
    const response = await apiClient.post<ApiResponse<TeacherProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.INVITE,
      payload
    );
    return response.data.data;
  },

  async createTeacherDirect(
    payload: SingleTeacherProvisionDirectPayload
  ): Promise<TeacherProvisionResult> {
    const response = await apiClient.post<ApiResponse<TeacherProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.DIRECT,
      payload
    );
    return response.data.data;
  },

  async provisionTeacher(
    payload: SingleTeacherProvisionPayload
  ): Promise<TeacherProvisionResult> {
    const response = await apiClient.post<ApiResponse<TeacherProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BASE,
      payload
    );
    return response.data.data;
  },

  async bulkProvisionTeachers(
    payload: BulkTeacherProvisionPayload
  ): Promise<TeacherBulkProvisionResult> {
    const response = await apiClient.post<ApiResponse<TeacherBulkProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BULK,
      payload
    );
    return response.data.data;
  },

  async bulkProvisionCsv(
    payload: BulkTeacherCsvPayload
  ): Promise<TeacherBulkProvisionResult> {
    const response = await apiClient.post<ApiResponse<TeacherBulkProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BULK_CSV,
      payload
    );
    return response.data.data;
  },

  async getTeachers(
    filters: TeacherQueryFilters = {}
  ): Promise<TeacherPaginatedResponse> {
    const response = await apiClient.get<ApiResponse<readonly TeacherRecord[]>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BASE,
      { params: filters }
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination || {
        total: response.data.data.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: 1,
      },
    };
  },

  async getTeacherById(id: string): Promise<TeacherRecord> {
    const response = await apiClient.get<ApiResponse<TeacherRecord>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BY_ID(id)
    );
    return response.data.data;
  },

  async updateTeacher(
    id: string,
    payload: UpdateTeacherPayload
  ): Promise<TeacherRecord> {
    const response = await apiClient.put<ApiResponse<TeacherRecord>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  async deactivateTeacher(
    id: string,
    status: string = "INACTIVE"
  ): Promise<TeacherRecord> {
    const response = await apiClient.patch<ApiResponse<TeacherRecord>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.DEACTIVATE(id),
      { status }
    );
    return response.data.data;
  },

  async activateTeacher(id: string): Promise<TeacherRecord> {
    const response = await apiClient.patch<ApiResponse<TeacherRecord>>(
      API_ENDPOINTS.PROVISIONING.TEACHERS.ACTIVATE(id)
    );
    return response.data.data;
  },
};
