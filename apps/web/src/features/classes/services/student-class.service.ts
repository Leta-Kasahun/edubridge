import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import { StudentMyClassData } from "../types";

export const studentClassService = {
  async getMyClass(): Promise<StudentMyClassData> {
    const response = await apiClient.get<ApiResponse<StudentMyClassData>>(
      API_ENDPOINTS.STUDENT_CLASS.MY_CLASS
    );
    return response.data.data;
  },
};
