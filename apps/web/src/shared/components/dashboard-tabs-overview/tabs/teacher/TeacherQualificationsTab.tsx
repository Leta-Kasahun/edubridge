"use client";

import { useMyTeacherQualifications } from "@/features/teacher-profile/hooks/useTeacherQualifications";
import { useMyTeacherExperiences } from "@/features/teacher-profile/hooks/useTeacherExperience";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherQualificationsTab() {
  const { data: qualifications, isLoading: isQualLoading } = useMyTeacherQualifications();
  const { data: experiences, isLoading: isExpLoading } = useMyTeacherExperiences();

  const qualList = qualifications ?? [];
  const expList = experiences ?? [];

  const bscCount = qualList.filter((q) => q.level === "BACHELOR").length;
  const mscCount = qualList.filter((q) => q.level === "MASTER").length;
  const phdCount = qualList.filter((q) => q.level === "DOCTORATE").length;
  const otherCount = Math.max(0, qualList.length - bscCount - mscCount - phdCount);

  const qualSlices: readonly ChartSliceItem[] = qualList.length > 0 ? [
    { name: "Master's Degree", value: mscCount, color: "#6366f1" },
    { name: "Bachelor's Degree", value: bscCount, color: "#0284c7" },
    { name: "Doctorate (PhD)", value: phdCount, color: "#8b5cf6" },
    { name: "Cert / Diploma", value: otherCount, color: "#059669" },
  ] : [
    { name: "Credentials", value: 1, color: "#059669" },
  ];

  const expSlices: readonly ChartSliceItem[] = [
    { name: "Teaching Posts", value: expList.length || 1, color: "#059669" },
    { name: "Academic Degrees", value: qualList.length || 1, color: "#0284c7" },
  ];

  const isLoadingMetrics = isQualLoading || isExpLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Degree Credentials"
          value={qualList.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Experience Records"
          value={expList.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Teaching Posts"
          value={expList.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Academic Degrees"
          value={qualList.length}
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Academic Qualifications"
          slices={qualSlices}
          centerLabel="Degrees"
          centerValue={qualList.length}
          isLoading={isQualLoading}
        />
        <DashboardDonutCard
          title="Career Records Breakdown"
          slices={expSlices}
          centerLabel="Records"
          centerValue={qualList.length + expList.length}
          isLoading={isExpLoading || isQualLoading}
        />
      </div>
    </div>
  );
}
