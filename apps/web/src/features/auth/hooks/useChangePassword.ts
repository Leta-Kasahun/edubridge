import { useMutation } from "@tanstack/react-query";
import { authService } from "../services";
import { ChangePasswordPayload, AuthResponseData } from "../types";

export function useChangePassword() {
  return useMutation<AuthResponseData, Error, ChangePasswordPayload>({
    mutationFn: authService.changePassword,
  });
}
