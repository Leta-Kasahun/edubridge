"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsService } from "../services/permissions.service";
import { useAuthStore } from "@/stores/auth.store";
import {
  CreateRolePayload,
  UpdateRolePayload,
  CreatePermissionPayload,
} from "../types/permissions.types";

const PERMISSION_KEYS = {
  roles: ["roles"] as const,
  role: (id: string) => ["roles", id] as const,
  rolePermissions: (id: string) => ["roles", id, "permissions"] as const,
  permissions: ["permissions"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: PERMISSION_KEYS.roles,
    queryFn: () => permissionsService.getAllRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(id: string, enabled = true) {
  return useQuery({
    queryKey: PERMISSION_KEYS.role(id),
    queryFn: () => permissionsService.getRoleById(id),
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissionsList() {
  return useQuery({
    queryKey: PERMISSION_KEYS.permissions,
    queryFn: () => permissionsService.getAllPermissions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRolePermissions(roleId: string, enabled = true) {
  return useQuery({
    queryKey: PERMISSION_KEYS.rolePermissions(roleId),
    queryFn: () => permissionsService.getRolePermissions(roleId),
    enabled: Boolean(roleId) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useHasPermission(
  resource: string,
  action: string
): boolean {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const roles = user.roles || [];
  if (roles.includes("SYSTEM_ADMIN") || roles.includes("SCHOOL_ADMIN")) {
    return true;
  }

  const requiredPermission = `${resource}:${action}`.toLowerCase();
  const wildcardPermission = `${resource}:manage`.toLowerCase();

  return roles.some((role) => {
    const normalized = role.toLowerCase();
    return normalized === requiredPermission || normalized === wildcardPermission;
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      permissionsService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.roles,
      });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      permissionsService.updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.roles,
      });
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.role(variables.id),
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionsService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.roles,
      });
    },
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) =>
      permissionsService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.permissions,
      });
    },
  });
}

export function useAssignPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => permissionsService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.rolePermissions(variables.roleId),
      });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => permissionsService.removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PERMISSION_KEYS.rolePermissions(variables.roleId),
      });
    },
  });
}
