"use client";

import { Menu, Search, Bell } from "lucide-react";
import { UserMenu } from "@/shared/components/UserMenu";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  readonly className?: string;
  readonly title?: string;
  readonly subtitle?: string;
}

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const toggleSidebarMobile = useUiStore((state) => state.toggleSidebarMobile);
  const user = useAuthStore((state) => state.user);
  const isSystemAdmin = user?.roles?.includes("SYSTEM_ADMIN") ?? false;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-2xs transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={toggleSidebarMobile}
          className="lg:hidden -ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden shrink-0 cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            placeholder={isSystemAdmin ? "Search platform resources..." : "Search across school..."}
            className="w-full h-8.5 pl-9 pr-3 text-xs bg-muted/50 hover:bg-muted/70 focus:bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
        <button
          type="button"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-hidden cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        <div className="h-5 w-px bg-border my-auto mx-0.5" />

        <UserMenu />
      </div>
    </header>
  );
}
