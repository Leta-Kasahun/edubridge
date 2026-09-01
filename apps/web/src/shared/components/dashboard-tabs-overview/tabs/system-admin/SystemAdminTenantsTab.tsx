"use client";

import { useTenants } from "@/features/provisioning/tenant/hooks/useTenantProvisioning";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function SystemAdminTenantsTab() {
  const { data: tenantsData, isLoading: isTenantsLoading } = useTenants({ limit: 100 });

  const tenantsList = tenantsData?.data ?? [];
  const totalTenants = tenantsData?.pagination?.total ?? tenantsList.length;

  const activeTenants = tenantsList.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenantsList.filter((t) => t.status === "SUSPENDED").length;

  const totalTeachers = tenantsList.reduce((acc, t) => acc + (t.totalTeachers || 0), 0);
  const totalStudents = tenantsList.reduce((acc, t) => acc + (t.totalStudents || 0), 0);

  const colors = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const tenantSlices: readonly ChartSliceItem[] = tenantsList.slice(0, 6).map((t, idx) => ({
    name: t.name,
    value: (t.totalStudents || 0) + (t.totalTeachers || 0) || 1,
    color: colors[idx % colors.length],
  }));

  const statusSlices: readonly ChartSliceItem[] = [
    { name: "Active Institutions", value: activeTenants, color: "#059669" },
    { name: "Suspended Institutions", value: suspendedTenants, color: "#e11d48" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Total Institutions"
          value={totalTenants}
          detail="Registered school partitions"
          isLoading={isTenantsLoading}
        />
        <DashboardMetricCard
          title="Active Institutions"
          value={activeTenants}
          detail="Fully operational domains"
          isLoading={isTenantsLoading}
        />
        <DashboardMetricCard
          title="Total Student Load"
          value={totalStudents.toLocaleString()}
          detail="Combined institutional pupils"
          isLoading={isTenantsLoading}
        />
        <DashboardMetricCard
          title="Total Faculty Load"
          value={totalTeachers.toLocaleString()}
          detail="Combined teaching staff"
          isLoading={isTenantsLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Institution Status Split"
          slices={statusSlices}
          centerLabel="Total"
          centerValue={totalTenants}
          isLoading={isTenantsLoading}
        />
        <DashboardDonutCard
          title="Top Institutions by User Load"
          slices={tenantSlices.length > 0 ? tenantSlices : [{ name: "Institutions", value: totalTenants, color: "#059669" }]}
          centerLabel="Schools"
          centerValue={totalTenants}
          isLoading={isTenantsLoading}
        />
      </div>
    </div>
  );
}
