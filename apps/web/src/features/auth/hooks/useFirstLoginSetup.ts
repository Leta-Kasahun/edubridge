import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService } from "../services";
import { FirstLoginSetupPayload, AuthResponseData } from "../types";

export function useFirstLoginSetup() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<AuthResponseData, Error, FirstLoginSetupPayload>({
    mutationFn: authService.firstLoginSetup,
    onSuccess: (data) => {
      if (data.user && data.tokens) {
        setAuth({
          user: data.user,
          accessToken: data.tokens.accessToken,
          expiresIn: data.tokens.expiresIn,
          tenantId: data.user.tenantId ?? undefined,
        });
      }
    },
  });
}
