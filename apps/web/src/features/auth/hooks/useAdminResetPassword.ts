"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { AdminResetPasswordPayload } from "../types";

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (payload: AdminResetPasswordPayload) =>
      authService.adminResetPassword(payload),
  });
}
