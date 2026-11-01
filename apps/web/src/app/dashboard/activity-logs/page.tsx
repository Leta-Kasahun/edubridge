"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { useAuthStore } from "@/stores/auth.store";
import {
  useActivityLogs,
  useActivityStats,
  type ActivityLogItem,
  ActivityLogTimeline,
  ActivityLogFilters,
  ActivityDetailModal,
} from "@/features/activity-log";
import { useTenants, type TenantRecord } from "@/features/provisioning/tenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  RotateCw,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function ActivityLogsPage() {
  const user = useAuthStore((s) => s.user);
  const isSystemAdmin = Boolean(user?.roles?.includes("SYSTEM_ADMIN"));

  const [page, setPage] = useState(1);
  const limit = 20;
  const [search, setSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogItem | null>(null);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedResource("");
    setSelectedAction("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setSelectedTenantId("");
    setPage(1);
  };

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      resource: selectedResource || undefined,
      action: selectedAction || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      tenantId: isSystemAdmin && selectedTenantId ? selectedTenantId : undefined,
    }),
    [
      page,
      limit,
      search,
      selectedResource,
      selectedAction,
      startDate,
      endDate,
      isSystemAdmin,
      selectedTenantId,
    ]
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useActivityLogs(queryParams);
  const { data: stats } = useActivityStats();

  const { data: tenantsData } = useTenants({ limit: 100 });
  const tenantsList = useMemo(() => {
    if (!tenantsData?.data) return [];
    return tenantsData.data.map((t: TenantRecord) => ({ id: t.id, name: t.name }));
  }, [tenantsData]);

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "School Activity Log", href: "/dashboard/activity-logs" },
  ];

  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN"]}>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Header Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center"
                  style={{ borderRadius: "50%" }}
                >
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    School System Activity Log
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Comprehensive audit trail and operational logs across academic, administrative, and student modules.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="cursor-pointer text-xs"
              >
                <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
                Refresh Logs
              </Button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Total Audit Records
                  </CardTitle>
                  <Layers className="w-4 h-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.totalCount}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Lifetime system operations
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Today&apos;s Activity
                  </CardTitle>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stats.todayCount}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Operations since midnight
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Security &amp; Auth Events
                  </CardTitle>
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {(stats.byResource.AUTH || 0) + (stats.byResource.SECURITY || 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Logins, 2FA, password events
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Academic &amp; Student Events
                  </CardTitle>
                  <Activity className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {(stats.byResource.STUDENT || 0) +
                      (stats.byResource.ENROLLMENT || 0) +
                      (stats.byResource.ASSESSMENT || 0)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Rosters, exams, and classes
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Card with Timeline & Filters */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="p-0 border-b border-border/80">
              <ActivityLogFilters
                search={search}
                onSearchChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                selectedResource={selectedResource}
                onResourceChange={(r) => {
                  setSelectedResource(r);
                  setPage(1);
                }}
                selectedAction={selectedAction}
                onActionChange={(a) => {
                  setSelectedAction(a);
                  setPage(1);
                }}
                datePreset={datePreset}
                onDatePresetChange={(p) => {
                  setDatePreset(p);
                  setPage(1);
                }}
                startDate={startDate}
                onStartDateChange={(d) => {
                  setStartDate(d);
                  setPage(1);
                }}
                endDate={endDate}
                onEndDateChange={(d) => {
                  setEndDate(d);
                  setPage(1);
                }}
                onResetFilters={handleResetFilters}
                isSystemAdmin={isSystemAdmin}
                selectedTenantId={selectedTenantId}
                onTenantChange={(t) => {
                  setSelectedTenantId(t);
                  setPage(1);
                }}
                tenants={tenantsList}
                defaultExpanded={true}
              />
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {isLoading && (
                <div className="space-y-4 py-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-muted/20 animate-pulse"
                    >
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isError && (
                <div className="p-10 text-center space-y-3 bg-destructive/5 rounded-2xl border border-destructive/20 my-4">
                  <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Unable to Retrieve Activities
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {error instanceof Error ? error.message : "Error querying audit log service."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry
                  </Button>
                </div>
              )}

              {!isLoading && !isError && items.length === 0 && (
                <div className="p-12 text-center space-y-3 my-6">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto border border-border/60">
                    <FileText className="w-7 h-7 stroke-1" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    No Activity Logs Found
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    No records match your selected criteria. Try adjusting the search or filter options.
                  </p>
                </div>
              )}

              {!isLoading && !isError && items.length > 0 && (
                <div className="space-y-6">
                  <ActivityLogTimeline
                    items={items}
                    showSchoolBadge={isSystemAdmin}
                    onSelectActivity={(item) => setSelectedActivity(item)}
                  />

                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/80">
                      <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-semibold text-foreground">
                          {(page - 1) * limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-semibold text-foreground">
                          {Math.min(page * limit, pagination.total)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-foreground">
                          {pagination.total}
                        </span>{" "}
                        entries
                      </p>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="h-8 px-2.5 text-xs cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                          Previous
                        </Button>

                        <span className="text-xs font-medium px-2 text-foreground">
                          Page {page} of {pagination.totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(pagination.totalPages, p + 1))
                          }
                          disabled={page >= pagination.totalPages}
                          className="h-8 px-2.5 text-xs cursor-pointer"
                        >
                          Next
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Modal */}
        <ActivityDetailModal
          activity={selectedActivity}
          isOpen={Boolean(selectedActivity)}
          onClose={() => setSelectedActivity(null)}
        />
      </DashboardLayout>
    </RoleGuard>
  );
}

