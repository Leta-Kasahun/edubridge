"use client";

import { cn } from "@/lib/utils";
import type { DashboardTabId, DashboardTabItem } from "./types";

interface DashboardTabsNavProps {
  readonly tabs: readonly DashboardTabItem[];
  readonly activeTab: DashboardTabId;
  readonly onTabChange: (tabId: DashboardTabId) => void;
}

export function DashboardTabsNav({
  tabs,
  activeTab,
  onTabChange,
}: DashboardTabsNavProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-none">
      <nav
        aria-label="Dashboard views"
        className="inline-flex min-w-full sm:min-w-0 items-center gap-1 p-1 rounded-2xl bg-card border border-border shadow-xs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null ? (
                <span
                  className={cn(
                    "ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
