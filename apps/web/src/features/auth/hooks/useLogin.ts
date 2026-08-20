import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService } from "../services";
import { LoginPayload, AuthResponseData } from "../types";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponseData, Error, LoginPayload>({
    mutationFn: authService.login,
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
