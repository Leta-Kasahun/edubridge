"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { securityService } from "../services/security.service";
import { UpdateSecurityPolicyPayload } from "../types/security.types";

const SECURITY_KEYS = {
  policy: ["security", "policy"] as const,
};

export function useSecurityPolicy() {
  return useQuery({
    queryKey: SECURITY_KEYS.policy,
    queryFn: () => securityService.getPolicy(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSecurityPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSecurityPolicyPayload) =>
      securityService.updatePolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SECURITY_KEYS.policy,
      });
    },
  });
}
