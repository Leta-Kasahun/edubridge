"use client";

import { useMyTeacherAssignments, useTeacherAssignedStudents } from "@/features/academic/assignments/teacher";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherClassesTab() {
  const {
    assignments,
    assignedGrades,
    assignedSections,
    isLoading: isAssignmentsLoading,
  } = useMyTeacherAssignments();

  const {
    totalStudents,
    studentGenderSlices,
    studentStatusSlices,
    isLoading: isStudentsLoading,
  } = useTeacherAssignedStudents();

  const colors = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const gradeSlices: readonly ChartSliceItem[] = assignedGrades.slice(0, 6).map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: assignments.filter((a) => a.gradeId === g.id).length || 1,
    color: colors[idx % colors.length],
  }));

  const sectionSlices: readonly ChartSliceItem[] = assignedSections.slice(0, 6).map((s, idx) => ({
    name: s.name,
    value: 1,
    color: colors[(idx + 2) % colors.length],
  }));

  const isLoadingMetrics = isAssignmentsLoading || isStudentsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Active Classes"
          value={assignedSections.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Grade Tiers"
          value={assignedGrades.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Average Class Size"
          value={assignedSections.length > 0 ? Math.round(totalStudents / assignedSections.length) : 0}
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Grade Distribution"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "Grades", value: 1, color: "#059669" }]}
          centerLabel="Levels"
          centerValue={assignedGrades.length}
          isLoading={isAssignmentsLoading}
        />
        <DashboardDonutCard
          title="Assigned Sections"
          slices={sectionSlices.length > 0 ? sectionSlices : [{ name: "Sections", value: 1, color: "#10B981" }]}
          centerLabel="Sections"
          centerValue={assignedSections.length}
          isLoading={isAssignmentsLoading}
        />
        <DashboardDonutCard
          title="Student Gender Split"
          slices={studentGenderSlices}
          centerLabel="Pupils"
          centerValue={totalStudents}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Enrollment Status"
          slices={studentStatusSlices}
          centerLabel="Enrolled"
          centerValue={totalStudents}
          isLoading={isStudentsLoading}
        />
      </div>
    </div>
  );
}
