"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { DonutDistributionCardProps } from "./types";

export function DashboardDonutCard({
  title,
  slices,
  centerLabel,
  centerValue,
  isLoading = false,
  emptyText = "No records found",
}: DonutDistributionCardProps) {
  const activeSlices = slices.filter((slice) => slice.value > 0);
  const total = activeSlices.reduce((acc, slice) => acc + slice.value, 0);

  return (
    <div className="bg-card text-card-foreground rounded-2xl border border-border p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors flex flex-col justify-between h-[340px] w-full">
      <div className="w-full flex items-center justify-between gap-2 h-7 shrink-0">
        <h4 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight truncate">
          {title}
        </h4>
        {total > 0 && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
            {total}
          </span>
        )}
      </div>

      <div className="w-full h-[155px] flex items-center justify-center relative shrink-0 my-auto">
        {isLoading ? (
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-3 border-muted/50 border-t-primary animate-spin" />
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-1">
              <span className="text-xs text-muted-foreground font-medium">0</span>
            </div>
            <p className="text-xs text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          <div className="relative w-full h-[155px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeSlices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={64}
                  paddingAngle={3}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {activeSlices.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const val = Number(item.value || 0);
                      const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                      return (
                        <div className="rounded-xl border border-border bg-popover px-3 py-1.5 shadow-sm text-xs">
                          <p className="font-semibold text-popover-foreground">{item.name}</p>
                          <p className="text-muted-foreground">
                            {val} ({pct}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {(centerValue !== undefined || centerLabel !== undefined) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                {centerValue !== undefined && (
                  <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
                    {centerValue}
                  </span>
                )}
                {centerLabel && (
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {centerLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full pt-3 border-t border-border mt-auto shrink-0 h-[76px] flex items-center justify-center overflow-hidden">
        <div className="w-full max-h-[64px] overflow-y-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
          {slices.map((slice) => (
            <div
              key={slice.name}
              className="flex items-center gap-1.5"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-muted-foreground truncate max-w-[115px]" title={slice.name}>
                {slice.name}
              </span>
              <span className="font-medium text-foreground">
                ({slice.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
