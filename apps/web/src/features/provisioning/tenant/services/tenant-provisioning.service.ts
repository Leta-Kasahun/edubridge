import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  ProvisionSchoolAdminInvitePayload,
  ProvisionSchoolAdminDirectPayload,
  ProvisionSchoolAdminPayload,
  ProvisionSchoolAdminResult,
  RegenerateCredentialsPayload,
  RegenerateCredentialsResult,
} from "../types/tenant-provisioning.types";

export const tenantProvisioningService = {
  inviteSchoolAdmin: async (
    payload: ProvisionSchoolAdminInvitePayload
  ): Promise<ProvisionSchoolAdminResult> => {
    const response = await apiClient.post<ApiResponse<ProvisionSchoolAdminResult>>(
      API_ENDPOINTS.PROVISIONING.TENANT.INVITE,
      payload
    );
    return response.data.data;
  },

  createSchoolAdminDirect: async (
    payload: ProvisionSchoolAdminDirectPayload
  ): Promise<ProvisionSchoolAdminResult> => {
    const response = await apiClient.post<ApiResponse<ProvisionSchoolAdminResult>>(
      API_ENDPOINTS.PROVISIONING.TENANT.DIRECT,
      payload
    );
    return response.data.data;
  },

  provisionSchoolAdmin: async (
    payload: ProvisionSchoolAdminPayload
  ): Promise<ProvisionSchoolAdminResult> => {
    const response = await apiClient.post<ApiResponse<ProvisionSchoolAdminResult>>(
      API_ENDPOINTS.PROVISIONING.TENANT.BASE,
      payload
    );
    return response.data.data;
  },

  regenerateCredentials: async (
    payload: RegenerateCredentialsPayload
  ): Promise<RegenerateCredentialsResult> => {
    const response = await apiClient.post<ApiResponse<RegenerateCredentialsResult>>(
      API_ENDPOINTS.PROVISIONING.TENANT.REGENERATE_CREDENTIALS,
      payload
    );
    return response.data.data;
  },
};
