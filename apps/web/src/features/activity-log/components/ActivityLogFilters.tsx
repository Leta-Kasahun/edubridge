"use client";

import { useState } from "react";
import {
  Search,
  X,
  Filter,
  Calendar,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ActivityLogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedResource: string;
  onResourceChange: (resource: string) => void;
  selectedAction: string;
  onActionChange: (action: string) => void;
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onResetFilters?: () => void;
  isSystemAdmin?: boolean;
  selectedTenantId?: string;
  onTenantChange?: (tenantId: string) => void;
  tenants?: Array<{ id: string; name: string }>;
  defaultExpanded?: boolean;
}

export const ACTION_OPTIONS = [
  { label: "All Event Types", value: "" },
  { label: "Create / Add", value: "CREATE" },
  { label: "Update / Modify", value: "UPDATE" },
  { label: "Delete / Remove", value: "DELETE" },
  { label: "Login / Session", value: "LOGIN" },
  { label: "Enrollment", value: "ENROLL" },
  { label: "Publish", value: "PUBLISH" },
  { label: "Grade", value: "GRADE" },
  { label: "Assignment", value: "ASSIGN" },
];

export const RESOURCE_PILLS = [
  { label: "All Modules", value: "" },
  { label: "Students", value: "STUDENT" },
  { label: "Teachers", value: "TEACHER" },
  { label: "Enrollment", value: "ENROLLMENT" },
  { label: "Academics", value: "ACADEMIC" },
  { label: "Curriculum", value: "CURRICULUM" },
  { label: "Assessments", value: "ASSESSMENT" },
  { label: "Attendance", value: "ATTENDANCE" },
  { label: "Mastery", value: "MASTERY" },
  { label: "Auth", value: "AUTH" },
];

export const DATE_PRESETS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Custom Range", value: "custom" },
];

export function calculateDatePresetRange(preset: string): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const formatYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  switch (preset) {
    case "today": {
      const todayStr = formatYMD(now);
      return { startDate: todayStr, endDate: todayStr };
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = formatYMD(y);
      return { startDate: yStr, endDate: yStr };
    }
    case "7days": {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return { startDate: formatYMD(past), endDate: formatYMD(now) };
    }
    case "30days": {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      return { startDate: formatYMD(past), endDate: formatYMD(now) };
    }
    case "all":
    default:
      return { startDate: "", endDate: "" };
  }
}

export function ActivityLogFilters({
  search,
  onSearchChange,
  selectedResource,
  onResourceChange,
  selectedAction,
  onActionChange,
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onResetFilters,
  isSystemAdmin = false,
  selectedTenantId = "",
  onTenantChange,
  tenants = [],
  defaultExpanded = false,
}: ActivityLogFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(defaultExpanded);

  const activeFilterCount =
    (search ? 1 : 0) +
    (selectedResource ? 1 : 0) +
    (selectedAction ? 1 : 0) +
    (datePreset !== "all" || startDate || endDate ? 1 : 0) +
    (selectedTenantId ? 1 : 0);

  const handlePresetSelect = (preset: string) => {
    onDatePresetChange(preset);
    if (preset !== "custom") {
      const range = calculateDatePresetRange(preset);
      onStartDateChange(range.startDate);
      onEndDateChange(range.endDate);
    }
  };

  const handleClearAll = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      onSearchChange("");
      onResourceChange("");
      onActionChange("");
      onDatePresetChange("all");
      onStartDateChange("");
      onEndDateChange("");
      if (onTenantChange) onTenantChange("");
    }
  };

  const selectedTenantName = tenants.find((t) => t.id === selectedTenantId)?.name;
  const selectedActionLabel = ACTION_OPTIONS.find((a) => a.value === selectedAction)?.label;
  const selectedResourceLabel = RESOURCE_PILLS.find((r) => r.value === selectedResource)?.label;

  return (
    <div className="space-y-2.5 p-3 sm:p-4 bg-muted/20 border-b border-border/80">
      {/* Row 1: Search, School (SysAdmin), & Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search activities by user, action, or details..."
            className="h-8 pl-8 pr-7 text-xs bg-background border-border rounded-lg placeholder:text-muted-foreground/80 focus-visible:ring-1 focus-visible:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* System Admin School Filter */}
        {isSystemAdmin && onTenantChange && tenants.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative flex items-center">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
              <select
                value={selectedTenantId}
                onChange={(e) => onTenantChange(e.target.value)}
                className="h-8 text-xs bg-background border border-border rounded-lg pl-8 pr-3 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer font-medium max-w-[170px] truncate"
              >
                <option value="">All Schools</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Filter Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={`h-8 px-2.5 text-xs font-medium cursor-pointer shrink-0 transition-colors ${
            showAdvanced || activeFilterCount > 0
              ? "border-primary/50 bg-primary/5 text-primary"
              : "text-muted-foreground"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="ml-1.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
            >
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown
            className={`w-3 h-3 ml-1 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Row 2: Advanced Filter Controls (Date & Event Type) */}
      {showAdvanced && (
        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs space-y-3 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Event Type (Action) Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                Event Type (Action)
              </label>
              <select
                value={selectedAction}
                onChange={(e) => onActionChange(e.target.value)}
                className="w-full h-8 text-xs bg-background border border-border rounded-lg px-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                {ACTION_OPTIONS.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Preset Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                Date Range
              </label>
              <select
                value={datePreset}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full h-8 text-xs bg-background border border-border rounded-lg px-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Pickers (Shown if Custom or dates present) */}
            {(datePreset === "custom" || startDate || endDate) && (
              <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Custom Interval
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      onStartDateChange(e.target.value);
                      onDatePresetChange("custom");
                    }}
                    className="h-8 text-xs bg-background border-border rounded-lg px-2"
                    title="Start Date"
                  />
                  <span className="text-muted-foreground text-xs font-medium">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      onEndDateChange(e.target.value);
                      onDatePresetChange("custom");
                    }}
                    className="h-8 text-xs bg-background border-border rounded-lg px-2"
                    title="End Date"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Row 3: Resource / Module Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <span>Module:</span>
        </span>
        {RESOURCE_PILLS.map((pill) => {
          const isActive = selectedResource === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => onResourceChange(pill.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/40"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Row 4: Active Filters Bar & Reset */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Active Filters:
            </span>

            {/* Event Action Chip */}
            {selectedAction && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[11px] font-medium">
                Event: {selectedActionLabel || selectedAction}
                <button
                  type="button"
                  onClick={() => onActionChange("")}
                  className="hover:text-foreground ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Resource Module Chip */}
            {selectedResource && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[11px] font-medium">
                Module: {selectedResourceLabel || selectedResource}
                <button
                  type="button"
                  onClick={() => onResourceChange("")}
                  className="hover:text-foreground ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Date Preset / Range Chip */}
            {(datePreset !== "all" || startDate || endDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-medium">
                Date:{" "}
                {datePreset !== "custom" && datePreset !== "all"
                  ? DATE_PRESETS.find((p) => p.value === datePreset)?.label
                  : `${startDate || "..."} → ${endDate || "..."}`}
                <button
                  type="button"
                  onClick={() => {
                    onDatePresetChange("all");
                    onStartDateChange("");
                    onEndDateChange("");
                  }}
                  className="hover:text-foreground ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* School Chip */}
            {selectedTenantId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                School: {selectedTenantName || "Selected"}
                <button
                  type="button"
                  onClick={() => onTenantChange && onTenantChange("")}
                  className="hover:text-foreground ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Chip */}
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20 text-[11px] font-medium">
                &ldquo;{search}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="hover:text-foreground ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Reset All Button */}
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}
    </div>
  );
}
