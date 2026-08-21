"use client";

import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { BreadcrumbItemData } from "@/shared/utils/breadcrumbs";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
  readonly breadcrumbs?: readonly BreadcrumbItemData[];
  readonly customBreadcrumbLabels?: Readonly<Record<string, string>>;
  readonly showBreadcrumbs?: boolean;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  customBreadcrumbLabels,
  showBreadcrumbs = true,
}: DashboardLayoutProps) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Sidebar />

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <DashboardHeader title={title} subtitle={subtitle} />

        {showBreadcrumbs && (
          <div className="w-full border-b border-border/80 bg-card/60 backdrop-blur-xs px-4 sm:px-6 lg:px-8 py-2">
            <div className="max-w-7xl mx-auto">
              <Breadcrumbs
                items={breadcrumbs}
                customLabels={customBreadcrumbLabels}
              />
            </div>
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
