import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser } from "@/shared/types";
import {
  setAuthTokens,
  clearAuthStorage,
  setTenantId as setStorageTenantId,
  clearTenantId as clearStorageTenantId,
} from "@/lib/apiClient";

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

export interface AuthActions {
  setAuth: (payload: {
    user: AuthUser;
    accessToken: string;
    expiresIn?: number;
    tenantId?: string;
  }) => void;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (accessToken: string, expiresIn?: number) => void;
  setTenantId: (tenantId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  tenantId: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: ({ user, accessToken, expiresIn, tenantId }) => {
        const resolvedTenantId = tenantId ?? user.tenantId ?? null;
        setAuthTokens(accessToken, expiresIn);
        if (resolvedTenantId) {
          setStorageTenantId(resolvedTenantId);
        }
        set({
          user,
          accessToken,
          tenantId: resolvedTenantId,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
      },
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
        }),
      setAccessToken: (accessToken, expiresIn) => {
        setAuthTokens(accessToken, expiresIn);
        set({
          accessToken,
          isAuthenticated: Boolean(accessToken),
        });
      },
      setTenantId: (tenantId) => {
        if (tenantId) {
          setStorageTenantId(tenantId);
        } else {
          clearStorageTenantId();
        }
        set({ tenantId });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setHydrated: (isHydrated) => set({ isHydrated }),
      logout: () => {
        clearAuthStorage();
        set({ ...initialState, isHydrated: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        tenantId: state.tenantId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

if (typeof window !== "undefined") {
  window.addEventListener("auth:unauthorized", () => {
    useAuthStore.getState().logout();
  });

  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.getState().setHydrated(true);
  } else {
    useAuthStore.persist.onFinishHydration(() => {
      useAuthStore.getState().setHydrated(true);
    });
  }
}
