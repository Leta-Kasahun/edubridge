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
  TenantQueryFilters,
  TenantPaginatedResponse,
  TenantRecord,
} from "../types/tenant-provisioning.types";

export const tenantProvisioningService = {
  getTenants: async (
    filters?: TenantQueryFilters
  ): Promise<TenantPaginatedResponse> => {
    const response = await apiClient.get<ApiResponse<readonly TenantRecord[]> & { pagination: TenantPaginatedResponse["pagination"] }>(
      API_ENDPOINTS.PROVISIONING.TENANT.BASE,
      { params: filters }
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getTenantById: async (id: string): Promise<TenantRecord> => {
    const response = await apiClient.get<ApiResponse<TenantRecord>>(
      API_ENDPOINTS.PROVISIONING.TENANT.BY_ID(id)
    );
    return response.data.data;
  },

  activateTenant: async (id: string): Promise<TenantRecord> => {
    const response = await apiClient.patch<ApiResponse<TenantRecord>>(
      API_ENDPOINTS.PROVISIONING.TENANT.ACTIVATE(id)
    );
    return response.data.data;
  },

  deactivateTenant: async (id: string): Promise<TenantRecord> => {
    const response = await apiClient.patch<ApiResponse<TenantRecord>>(
      API_ENDPOINTS.PROVISIONING.TENANT.DEACTIVATE(id)
    );
    return response.data.data;
  },

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
