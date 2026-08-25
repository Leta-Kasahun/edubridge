"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantProvisioningService } from "../services/tenant-provisioning.service";
import {
  ProvisionSchoolAdminInvitePayload,
  ProvisionSchoolAdminDirectPayload,
  ProvisionSchoolAdminPayload,
  RegenerateCredentialsPayload,
  TenantQueryFilters,
} from "../types/tenant-provisioning.types";

export const PROVISIONING_TENANT_KEYS = {
  all: ["provisioning", "tenant"] as const,
  list: (filters: TenantQueryFilters = {}) =>
    ["provisioning", "tenant", "list", filters] as const,
  detail: (id: string) => ["provisioning", "tenant", "detail", id] as const,
};

export function useTenants(filters: TenantQueryFilters = {}) {
  return useQuery({
    queryKey: PROVISIONING_TENANT_KEYS.list(filters),
    queryFn: () => tenantProvisioningService.getTenants(filters),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: PROVISIONING_TENANT_KEYS.detail(id),
    queryFn: () => tenantProvisioningService.getTenantById(id),
    enabled: Boolean(id),
  });
}

export function useActivateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantProvisioningService.activateTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}

export function useDeactivateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantProvisioningService.deactivateTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}

export function useInviteSchoolAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProvisionSchoolAdminInvitePayload) =>
      tenantProvisioningService.inviteSchoolAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}

export function useCreateSchoolAdminDirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProvisionSchoolAdminDirectPayload) =>
      tenantProvisioningService.createSchoolAdminDirect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}

export function useProvisionSchoolAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProvisionSchoolAdminPayload) =>
      tenantProvisioningService.provisionSchoolAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}

export function useRegenerateCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegenerateCredentialsPayload) =>
      tenantProvisioningService.regenerateCredentials(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROVISIONING_TENANT_KEYS.all,
      });
    },
  });
}
