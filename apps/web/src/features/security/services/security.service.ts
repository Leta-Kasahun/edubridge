import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import { SecurityPolicy, UpdateSecurityPolicyPayload } from "../types/security.types";

export const securityService = {
  getPolicy: async (): Promise<SecurityPolicy> => {
    const response = await apiClient.get<ApiResponse<SecurityPolicy>>(
      API_ENDPOINTS.SECURITY_POLICY.BASE
    );
    return response.data.data;
  },

  updatePolicy: async (
    payload: UpdateSecurityPolicyPayload
  ): Promise<SecurityPolicy> => {
    const response = await apiClient.put<ApiResponse<SecurityPolicy>>(
      API_ENDPOINTS.SECURITY_POLICY.BASE,
      payload
    );
    return response.data.data;
  },
};
