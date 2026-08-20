import { useMutation } from "@tanstack/react-query";
import { authService } from "../services";
import { ResendOtpPayload, AuthResponseData } from "../types";

export function useResendOtp() {
  return useMutation<AuthResponseData, Error, ResendOtpPayload>({
    mutationFn: authService.resendOtp,
  });
}
