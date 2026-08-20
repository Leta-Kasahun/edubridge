import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService } from "../services";
import { VerifyOtpPayload, AuthResponseData } from "../types";

export function useVerifyOtp() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponseData, Error, VerifyOtpPayload>({
    mutationFn: authService.verifyOtp,
    onSuccess: (data) => {
      if (data.user && data.tokens) {
        setAuth({
          user: data.user,
          accessToken: data.tokens.accessToken,
          expiresIn: data.tokens.expiresIn,
        });
      }
    },
  });
}
