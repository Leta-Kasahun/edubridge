import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UiState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
}

export interface UiActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarMobile: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
}

export type UiStore = UiState & UiActions;

const initialState: UiState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
};

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      ...initialState,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarMobile: () =>
        set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
