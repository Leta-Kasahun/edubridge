"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantProvisioningService } from "../services/tenant-provisioning.service";
import {
  ProvisionSchoolAdminInvitePayload,
  ProvisionSchoolAdminDirectPayload,
  ProvisionSchoolAdminPayload,
  RegenerateCredentialsPayload,
} from "../types/tenant-provisioning.types";

export const PROVISIONING_TENANT_KEYS = {
  all: ["provisioning", "tenant"] as const,
};

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
