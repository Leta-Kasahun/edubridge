"use client";

import type { MetricSummaryItem } from "./types";

export function DashboardMetricCard({
  title,
  value,
  detail,
  isLoading = false,
}: MetricSummaryItem) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between h-full min-h-[115px] w-full">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
          {title}
        </p>
        <div className="mt-2 flex items-baseline">
          {isLoading ? (
            <div className="h-8 w-24 bg-muted/60 rounded-lg animate-pulse" />
          ) : (
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
          )}
        </div>
      </div>

      {detail ? (
        <p className="mt-2 text-xs text-muted-foreground truncate">{detail}</p>
      ) : null}
    </div>
  );
}
