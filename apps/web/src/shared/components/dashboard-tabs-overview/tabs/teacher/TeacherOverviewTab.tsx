"use client";

import { useMyTeacherAssignments, useTeacherAssignedStudents } from "@/features/academic/assignments/teacher";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherOverviewTab() {
  const {
    assignments,
    assignedSubjects,
    assignedGrades,
    assignedSections,
    isLoading: isAssignmentsLoading,
  } = useMyTeacherAssignments();

  const {
    totalStudents,
    maleStudents,
    femaleStudents,
    studentStatusSlices,
    studentGenderSlices,
    isLoading: isStudentsLoading,
  } = useTeacherAssignedStudents();

  const gradeColors = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const gradeSlices: readonly ChartSliceItem[] = assignedGrades.map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: assignments.filter((a) => a.gradeId === g.id).length || 1,
    color: gradeColors[idx % gradeColors.length],
  }));

  const subjectColors = ["#6366f1", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const subjectSlices: readonly ChartSliceItem[] = assignedSubjects.map((s, idx) => ({
    name: s.name,
    value: assignments.filter((a) => a.subjectId === s.id).length || 1,
    color: subjectColors[idx % subjectColors.length],
  }));

  const isLoadingMetrics = isAssignmentsLoading || isStudentsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Assigned Classes"
          value={assignedSections.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Classroom Students"
          value={totalStudents.toLocaleString()}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Active Courses"
          value={assignedSubjects.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Grade Levels"
          value={assignedGrades.length}
          isLoading={isAssignmentsLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Student Status Split"
          slices={studentStatusSlices}
          centerLabel="Pupils"
          centerValue={totalStudents}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Student Gender Ratio"
          slices={studentGenderSlices}
          centerLabel="Ratio"
          centerValue={`${maleStudents}:${femaleStudents}`}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Grade Breakdown"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "No Grades", value: 1, color: "#94a3b8" }]}
          centerLabel="Grades"
          centerValue={assignedGrades.length}
          isLoading={isAssignmentsLoading}
        />
        <DashboardDonutCard
          title="Assigned Courses"
          slices={subjectSlices.length > 0 ? subjectSlices : [{ name: "No Courses", value: 1, color: "#94a3b8" }]}
          centerLabel="Courses"
          centerValue={assignedSubjects.length}
          isLoading={isAssignmentsLoading}
        />
      </div>
    </div>
  );
}
