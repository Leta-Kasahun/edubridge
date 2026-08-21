import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
  CreatePermissionPayload,
  RolePermission,
} from "../types/permissions.types";

export const permissionsService = {
  getAllRoles: async (): Promise<readonly Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>(
      API_ENDPOINTS.ROLES.BASE
    );
    return response.data.data;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
    return response.data.data;
  },

  createRole: async (payload: CreateRolePayload): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>(
      API_ENDPOINTS.ROLES.BASE,
      payload
    );
    return response.data.data;
  },

  updateRole: async (id: string, payload: UpdateRolePayload): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(
      API_ENDPOINTS.ROLES.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
  },

  getAllPermissions: async (): Promise<readonly Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>(
      API_ENDPOINTS.PERMISSIONS.BASE
    );
    return response.data.data;
  },

  createPermission: async (
    payload: CreatePermissionPayload
  ): Promise<Permission> => {
    const response = await apiClient.post<ApiResponse<Permission>>(
      API_ENDPOINTS.PERMISSIONS.BASE,
      payload
    );
    return response.data.data;
  },

  getRolePermissions: async (
    roleId: string
  ): Promise<readonly RolePermission[]> => {
    const response = await apiClient.get<ApiResponse<RolePermission[]>>(
      API_ENDPOINTS.ROLES.PERMISSIONS(roleId)
    );
    return response.data.data;
  },

  assignPermissionToRole: async (
    roleId: string,
    permissionId: string
  ): Promise<RolePermission> => {
    const response = await apiClient.post<ApiResponse<RolePermission>>(
      API_ENDPOINTS.ROLES.PERMISSIONS(roleId),
      { permissionId }
    );
    return response.data.data;
  },

  removePermissionFromRole: async (
    roleId: string,
    permissionId: string
  ): Promise<void> => {
    await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ROLES.PERMISSION_BY_ID(roleId, permissionId)
    );
  },
};
