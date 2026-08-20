import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { authService } from "../services";

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: authService.logout,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useLogoutAll() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: authService.logoutAll,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}
