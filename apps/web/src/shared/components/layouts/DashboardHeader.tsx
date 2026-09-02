"use client";

import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import { UserMenu } from "@/shared/components/UserMenu";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Logo } from "@/shared/components/Logo";
import { BreadcrumbItemData } from "@/shared/utils/breadcrumbs";
import { useUiStore } from "@/stores/ui.store";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  readonly className?: string;
  readonly breadcrumbs?: readonly BreadcrumbItemData[];
  readonly customBreadcrumbLabels?: Readonly<Record<string, string>>;
}

export function DashboardHeader({
  className,
  breadcrumbs,
  customBreadcrumbLabels,
}: DashboardHeaderProps) {
  const toggleSidebarMobile = useUiStore((state) => state.toggleSidebarMobile);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 shadow-2xs transition-all",
        className
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={toggleSidebarMobile}
          className="lg:hidden -ml-1 p-1.5 sm:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-hidden shrink-0 cursor-pointer"
          aria-label="Open navigation sidebar"
        >
          <Menu size={19} />
        </button>

        <div className="lg:hidden flex items-center shrink-0">
          <Link href={ROUTES.HOME} title="EduBridge Home">
            <Logo variant="mark" size="xs" frame="none" />
          </Link>
        </div>

        <div className="min-w-0 overflow-hidden flex-1">
          <Breadcrumbs
            items={breadcrumbs}
            customLabels={customBreadcrumbLabels}
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
