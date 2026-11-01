"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import {
  useInfiniteActivityLogs,
  useActivityStats,
} from "../hooks/useActivityLogs";
import { ActivityLogItem as ActivityLogItemType } from "../types/activity-log.types";
import { ActivityLogTimeline } from "./ActivityLogTimeline";
import { ActivityLogFilters } from "./ActivityLogFilters";
import { ActivityDetailModal } from "./ActivityDetailModal";
import { useTenants, type TenantRecord } from "@/features/provisioning/tenant";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  X,
  RotateCw,
  ExternalLink,
  AlertCircle,
  FileText,
  Activity,
  Layers,
} from "lucide-react";

interface SchoolActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchoolActivityLogDrawer({
  isOpen,
  onClose,
}: SchoolActivityLogDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const isSystemAdmin = Boolean(user?.roles?.includes("SYSTEM_ADMIN"));

  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityLogItemType | null>(null);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedResource("");
    setSelectedAction("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setSelectedTenantId("");
  };

  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Query activities with infinite scroll / load more
  const queryParams = useMemo(
    () => ({
      limit: 15,
      search: search.trim() || undefined,
      resource: selectedResource || undefined,
      action: selectedAction || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tenantId: isSystemAdmin && selectedTenantId ? selectedTenantId : undefined,
    }),
    [
      search,
      selectedResource,
      selectedAction,
      startDate,
      endDate,
      isSystemAdmin,
      selectedTenantId,
    ]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteActivityLogs(queryParams);

  const { data: stats } = useActivityStats();

  // Load tenants list for system admin school filter
  const { data: tenantsData } = useTenants({ limit: 100 });
  const tenantsList = useMemo(() => {
    if (!tenantsData?.data) return [];
    return tenantsData.data.map((t: TenantRecord) => ({ id: t.id, name: t.name }));
  }, [tenantsData]);

  // Flatten all paginated pages into single array
  const allItems = useMemo<ActivityLogItemType[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  const totalCount = data?.pages?.[0]?.pagination?.total ?? 0;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-label="School System Activity Log"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] md:w-[540px] lg:w-[600px] bg-background text-foreground shadow-2xl flex flex-col border-l border-border transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/90 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs"
              style={{ borderRadius: "50%" }}
            >
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground tracking-tight">
                  School Activity Log
                </h2>
                <Badge
                  variant="outline"
                  className="text-[11px] font-mono py-0 px-1.5 bg-primary/5 text-primary border-primary/30"
                >
                  {totalCount} events
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isSystemAdmin
                  ? "National Platform & Multi-School Audit Trail"
                  : "Live School Operations & Audit Trail"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh logs"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isFetching ? "animate-spin text-primary" : ""}`} />
              <span className="sr-only">Refresh activities</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title="Close drawer"
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Close drawer</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Ribbon (if stats available) */}
        {stats && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border text-[11px] text-muted-foreground shrink-0">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>Today&apos;s Operations:</span>
              <span className="font-semibold text-foreground">{stats.todayCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Lifetime Audit Logs:</span>
              <span className="font-semibold text-foreground">{stats.totalCount}</span>
            </div>
          </div>
        )}

        {/* Filters Toolbar */}
        <ActivityLogFilters
          search={search}
          onSearchChange={setSearch}
          selectedResource={selectedResource}
          onResourceChange={setSelectedResource}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onResetFilters={handleResetFilters}
          isSystemAdmin={isSystemAdmin}
          selectedTenantId={selectedTenantId}
          onTenantChange={setSelectedTenantId}
          tenants={tenantsList}
        />

        {/* Drawer Body - Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-muted/20 animate-pulse"
                >
                  <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="p-6 text-center space-y-3 bg-destructive/5 rounded-2xl border border-destructive/20 my-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Failed to Load School Activities
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {error instanceof Error ? error.message : "Unable to retrieve activity log records. Please verify connection."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !isError && allItems.length === 0 && (
            <div className="p-10 text-center space-y-3 my-6">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto border border-border/60">
                <FileText className="w-7 h-7 stroke-1" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No Activities Recorded
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {search || selectedResource || selectedTenantId
                  ? "No activity logs match the selected filter criteria. Try clearing filters."
                  : "New administrative actions, student registrations, assessments, and logins will appear here."}
              </p>
              {(search || selectedResource || selectedTenantId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setSelectedResource("");
                    setSelectedTenantId("");
                  }}
                  className="cursor-pointer text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && allItems.length > 0 && (
            <div className="space-y-4">
              <ActivityLogTimeline
                items={allItems}
                showSchoolBadge={isSystemAdmin}
                onSelectActivity={(item) => setSelectedActivity(item)}
              />

              {/* Load More Button */}
              {hasNextPage && (
                <div className="pt-2 pb-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full sm:w-auto px-6 cursor-pointer text-xs"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin text-primary" />
                        Loading more...
                      </>
                    ) : (
                      `Load More Activities (${allItems.length} of ${totalCount})`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-card/95 flex items-center justify-between gap-3 shrink-0">
          <Link
            href="/dashboard/activity-logs"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <span>View All Activity Logs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Close
          </Button>
        </div>
      </aside>

      {/* Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}

