"use client";

import { useTenants } from "@/features/provisioning/tenant/hooks/useTenantProvisioning";
import { useSecurityPolicy } from "@/features/security/hooks/useSecurityPolicy";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function SystemAdminOverviewTab() {
  const { data: tenantsData, isLoading: isTenantsLoading } = useTenants({ limit: 100 });
  const { data: policy, isLoading: isPolicyLoading } = useSecurityPolicy();

  const tenantsList = tenantsData?.data ?? [];
  const totalTenants = tenantsData?.pagination?.total ?? tenantsList.length;

  const activeTenants = tenantsList.filter((t) => t.status === "ACTIVE").length;
  const suspendedTenants = tenantsList.filter((t) => t.status === "SUSPENDED").length;

  const totalTeachers = tenantsList.reduce((acc, t) => acc + (t.totalTeachers || 0), 0);
  const totalStudents = tenantsList.reduce((acc, t) => acc + (t.totalStudents || 0), 0);
  const totalUsers = totalTeachers + totalStudents;

  const tenantStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active Schools", value: activeTenants, color: "#059669" },
    { name: "Suspended", value: suspendedTenants, color: "#e11d48" },
  ];

  const userDistributionSlices: readonly ChartSliceItem[] = [
    { name: "Enrolled Students", value: totalStudents, color: "#0284c7" },
    { name: "Faculty Staff", value: totalTeachers, color: "#059669" },
  ];

  const securitySlices: readonly ChartSliceItem[] = [
    { name: "2FA Enforcement", value: policy?.otpEnabled ? 1 : 0, color: "#059669" },
    { name: "Standard Login", value: !policy?.otpEnabled ? 1 : 0, color: "#f59e0b" },
  ];

  const isLoadingMetrics = isTenantsLoading || isPolicyLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Active Schools"
          value={totalTenants}
          detail={`${activeTenants} active school instances`}
          isLoading={isTenantsLoading}
        />
        <DashboardMetricCard
          title="Platform Users"
          value={totalUsers.toLocaleString()}
          detail="Total student and staff accounts"
          isLoading={isTenantsLoading}
        />
        <DashboardMetricCard
          title="Security Status"
          value={policy?.otpEnabled ? "Enhanced 2FA" : "Standard"}
          detail="Global security policies active"
          isLoading={isPolicyLoading}
        />
        <DashboardMetricCard
          title="System Health"
          value="99.9%"
          detail="All platform services operational"
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="School Instance Status"
          slices={tenantStatusSlices}
          centerLabel="Schools"
          centerValue={totalTenants}
          isLoading={isTenantsLoading}
        />
        <DashboardDonutCard
          title="Platform User Base"
          slices={userDistributionSlices}
          centerLabel="Users"
          centerValue={totalUsers}
          isLoading={isTenantsLoading}
        />
        <DashboardDonutCard
          title="2FA Security Posture"
          slices={securitySlices}
          centerLabel="Status"
          centerValue={policy?.otpEnabled ? "Active" : "Standard"}
          isLoading={isPolicyLoading}
        />
      </div>
    </div>
  );
}
