"use client";

import { Suspense } from "react";
import { useUiStore } from "@/stores/ui.store";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { BreadcrumbItemData } from "@/shared/utils/breadcrumbs";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  readonly children: React.ReactNode;
  readonly breadcrumbs?: readonly BreadcrumbItemData[];
  readonly customBreadcrumbLabels?: Readonly<Record<string, string>>;
}

export function DashboardLayout({
  children,
  breadcrumbs,
  customBreadcrumbLabels,
}: DashboardLayoutProps) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Suspense fallback={<div className="w-64 hidden lg:block bg-sidebar" />}>
        <Sidebar />
      </Suspense>

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Suspense fallback={<header className="h-14 w-full border-b border-border bg-card" />}>
          <DashboardHeader
            breadcrumbs={breadcrumbs}
            customBreadcrumbLabels={customBreadcrumbLabels}
          />
        </Suspense>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
