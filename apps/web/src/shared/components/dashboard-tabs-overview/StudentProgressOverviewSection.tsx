"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, BookOpen } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface StudentProgressStats {
  readonly mastered: number;
  readonly proficient: number;
  readonly developing: number;
  readonly inProgress: number;
}

export interface ProgressBreakdownItem {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly status?:
    | "Mastered"
    | "Proficient"
    | "Developing"
    | "Not Started"
    | "Doing Well"
    | "Learning"
    | "In Progress";
}

export interface StudentProgressOverviewSectionProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly fullProgressHref?: string;
  readonly centerCount: number;
  readonly centerLabel: string;
  readonly breakdownTitle: string;
  readonly breakdownCountLabel: string;
  readonly stats: StudentProgressStats;
  readonly items: readonly ProgressBreakdownItem[];
  readonly isLoading?: boolean;
  readonly emptyText?: string;
}

export function StudentProgressOverviewSection({
  title = "Student Progress",
  subtitle = "Real-time learning mastery and subject breakdown",
  fullProgressHref = ROUTES.MASTERY,
  centerCount,
  centerLabel,
  breakdownTitle,
  breakdownCountLabel,
  stats,
  items,
  isLoading = false,
  emptyText = "No active progress records available.",
}: StudentProgressOverviewSectionProps): React.JSX.Element {
  // SVG Donut Chart Dimensions matching Student Dashboard
  const donutSize = 120;
  const strokeWidth = 14;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = Math.max(
    1,
    stats.mastered + stats.proficient + stats.developing + stats.inProgress
  );

  const seg1Len = (stats.mastered / total) * circumference;
  const seg1Offset = 0;

  const seg2Len = (stats.proficient / total) * circumference;
  const seg2Offset = -seg1Len;

  const seg3Len = (stats.developing / total) * circumference;
  const seg3Offset = -(seg1Len + seg2Len);

  const seg4Len = (stats.inProgress / total) * circumference;
  const seg4Offset = -(seg1Len + seg2Len + seg3Len);

  const safeItems = useMemo(() => {
    return items.map((item) => {
      const progress = Math.max(0, Math.min(100, Math.round(item.progress)));
      let status: "Mastered" | "Proficient" | "Developing" | "Not Started" =
        item.status === "Doing Well"
          ? "Proficient"
          : item.status === "Learning"
          ? "Developing"
          : item.status === "In Progress"
          ? "Not Started"
          : item.status || "Not Started";

      if (!item.status) {
        if (progress >= 80) status = "Mastered";
        else if (progress >= 50) status = "Proficient";
        else if (progress > 0) status = "Developing";
        else status = "Not Started";
      }

      return {
        ...item,
        progress,
        status,
      };
    });
  }, [items]);

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href={fullProgressHref}
          className="text-xs font-semibold text-primary hover:underline shrink-0"
        >
          Full progress
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Overall Learning Donut Chart & Status Breakdown */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 flex flex-col items-center justify-between space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
            Overall Learning
          </span>

          {/* Donut Chart with center count */}
          <div className="relative inline-flex items-center justify-center my-1">
            <svg
              width={donutSize}
              height={donutSize}
              className="transform -rotate-90"
            >
              {/* Background track */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted/30"
                fill="transparent"
              />
              {/* 1. Mastered (>=80%) — Emerald */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg1Len} ${circumference}`}
                strokeDashoffset={seg1Offset}
                className="text-emerald-500 transition-all duration-700"
                fill="transparent"
              />
              {/* 2. Proficient (50%-79%) — Blue */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg2Len} ${circumference}`}
                strokeDashoffset={seg2Offset}
                className="text-blue-500 transition-all duration-700"
                fill="transparent"
              />
              {/* 3. Developing (>0%-49%) — Amber */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg3Len} ${circumference}`}
                strokeDashoffset={seg3Offset}
                className="text-amber-500 transition-all duration-700"
                fill="transparent"
              />
              {/* 4. Not Started (0%) — Muted */}
              <circle
                cx={donutSize / 2}
                cy={donutSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg4Len} ${circumference}`}
                strokeDashoffset={seg4Offset}
                className="text-muted-foreground/30 transition-all duration-700"
                fill="transparent"
              />
            </svg>

            {/* Inside center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isLoading ? (
                <div className="h-6 w-12 bg-muted/60 rounded animate-pulse" />
              ) : (
                <>
                  <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                    {centerCount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {centerLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Learning breakdown list */}
          <div className="w-full space-y-2 pt-2 border-t border-border/60">
            <p className="text-xs font-bold text-foreground text-left">
              Progress Status
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-muted-foreground font-medium">Mastered</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {stats.mastered.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-muted-foreground font-medium">Proficient</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {stats.proficient.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-muted-foreground font-medium">Developing</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {stats.developing.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-muted-foreground font-medium">Not Started</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">
                  {stats.inProgress.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Topics / Courses Progress List */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {breakdownTitle}
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                {breakdownCountLabel}
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-2 animate-pulse">
                    <div className="h-3 w-32 bg-muted/60 rounded" />
                    <div className="h-2 w-full bg-muted/40 rounded-full" />
                  </div>
                ))}
              </div>
            ) : safeItems.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{emptyText}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {safeItems.map((item) => {
                  const isMastered = item.status === "Mastered";
                  const isProficient =
                    item.status === "Proficient" || item.status === "Doing Well";
                  const isDeveloping =
                    item.status === "Developing" || item.status === "Learning";

                  const barColor = isMastered
                    ? "bg-emerald-500"
                    : isProficient
                    ? "bg-blue-500"
                    : isDeveloping
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30";

                  const badgeStyle = isMastered
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 border"
                    : isProficient
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 border"
                    : isDeveloping
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 border"
                    : "bg-muted text-muted-foreground border-border border";

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-foreground truncate">
                            {item.name}
                          </span>
                          {item.subtitle && (
                            <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                              ({item.subtitle})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="font-bold text-foreground tabular-nums">
                            {item.progress}%
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badgeStyle}`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
