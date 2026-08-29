import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  SingleStudentProvisionPayload,
  BulkStudentCsvPayload,
  StudentProvisionResult,
  StudentBulkProvisionResult,
  StudentRecord,
  StudentQueryFilters,
  StudentPaginatedResponse,
  AcademicStructureResponse,
} from "../types/student-provisioning.types";

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

export const studentProvisioningService = {
  async getAcademicStructure(
    academicYearId?: string
  ): Promise<AcademicStructureResponse> {
    const response = await apiClient.get<ApiResponse<AcademicStructureResponse>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.ACADEMIC_STRUCTURE,
      { params: academicYearId ? { academicYearId } : undefined }
    );
    return response.data.data;
  },

  async createGrade(payload: { level: number }): Promise<unknown> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.GRADES,
      payload
    );
    return response.data.data;
  },

  async createSection(payload: {
    academicYearId: string;
    gradeId: string;
    name: string;
    capacity?: number;
  }): Promise<unknown> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.SECTIONS,
      payload
    );
    return response.data.data;
  },

  async getStudents(
    filters: StudentQueryFilters = {}
  ): Promise<StudentPaginatedResponse> {
    const response = await apiClient.get<ApiResponse<readonly StudentRecord[]>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.BASE,
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

  async getStudentById(id: string): Promise<StudentRecord> {
    const response = await apiClient.get<ApiResponse<StudentRecord>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.BY_ID(id)
    );
    return response.data.data;
  },

  async provisionStudent(
    payload: SingleStudentProvisionPayload
  ): Promise<StudentProvisionResult> {
    const response = await apiClient.post<ApiResponse<StudentProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.BASE,
      payload
    );
    return response.data.data;
  },

  async bulkProvisionCsv(
    payload: BulkStudentCsvPayload
  ): Promise<StudentBulkProvisionResult> {
    const response = await apiClient.post<ApiResponse<StudentBulkProvisionResult>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.BULK_CSV,
      payload
    );
    return response.data.data;
  },

  async deactivateStudent(
    id: string,
    status: string = "INACTIVE"
  ): Promise<StudentRecord> {
    const response = await apiClient.patch<ApiResponse<StudentRecord>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.DEACTIVATE(id),
      { status }
    );
    return response.data.data;
  },

  async activateStudent(id: string): Promise<StudentRecord> {
    const response = await apiClient.patch<ApiResponse<StudentRecord>>(
      API_ENDPOINTS.PROVISIONING.STUDENTS.ACTIVATE(id)
    );
    return response.data.data;
  },
};
