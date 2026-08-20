import { useMutation } from "@tanstack/react-query";
import { authService } from "../services";
import { FirstLoginSetupPayload, AuthResponseData } from "../types";

export function useFirstLoginSetup() {
  return useMutation<AuthResponseData, Error, FirstLoginSetupPayload>({
    mutationFn: authService.firstLoginSetup,
  });
}
