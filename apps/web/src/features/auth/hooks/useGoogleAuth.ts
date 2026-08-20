import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService } from "../services";
import { GoogleAuthPayload, AuthResponseData } from "../types";

export function useGoogleAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponseData, Error, GoogleAuthPayload>({
    mutationFn: authService.googleAuth,
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
