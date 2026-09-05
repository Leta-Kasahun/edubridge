"use client";

import { useMemo } from "react";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";
import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
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

  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ limit: 100 });
  const rawStudents = studentsData?.data ?? [];

  const assignedSectionIds = useMemo(
    () => new Set(assignedSections.map((s) => s.id)),
    [assignedSections]
  );

  const scopedStudents = useMemo(() => {
    if (assignedSectionIds.size === 0) return rawStudents;
    return rawStudents.filter((st) => st.sectionId && assignedSectionIds.has(st.sectionId));
  }, [rawStudents, assignedSectionIds]);

  const totalStudents = scopedStudents.length;
  const maleStudents = scopedStudents.filter((s) => s.gender === "MALE").length;
  const femaleStudents = scopedStudents.filter((s) => s.gender === "FEMALE").length;

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

  const genderSlices: readonly ChartSliceItem[] = [
    { name: "Male Pupils", value: maleStudents, color: "#0EA5E9" },
    { name: "Female Pupils", value: femaleStudents, color: "#F97316" },
  ];

  const studentStatusSlices: readonly ChartSliceItem[] = [
    {
      name: "Enrolled Active",
      value: scopedStudents.filter(
        (s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE"
      ).length,
      color: "#10B981",
    },
    {
      name: "Pending Setup",
      value: scopedStudents.filter(
        (s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE"
      ).length,
      color: "#f59e0b",
    },
  ];

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
          slices={genderSlices}
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
