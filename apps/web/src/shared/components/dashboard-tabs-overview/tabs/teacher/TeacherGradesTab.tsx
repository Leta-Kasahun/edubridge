"use client";

import { useMyTeacherAssignments, useTeacherAssignedStudents } from "@/features/academic/assignments/teacher";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherGradesTab() {
  const {
    assignments,
    assignedGrades,
    assignedSections,
    assignedSubjects,
    isLoading: isAssignmentsLoading,
  } = useMyTeacherAssignments();

  const {
    totalStudents,
    maleStudents,
    femaleStudents,
    studentGenderSlices,
    isLoading: isStudentsLoading,
  } = useTeacherAssignedStudents();

  const palette = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];

  const gradeSlices: readonly ChartSliceItem[] = assignedGrades.map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: assignments.filter((a) => a.gradeId === g.id).length || 1,
    color: palette[idx % palette.length],
  }));

  const gradeSectionSlices: readonly ChartSliceItem[] = assignedGrades.map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: assignedSections.filter((s) => s.gradeId === g.id).length || 1,
    color: palette[(idx + 1) % palette.length],
  }));

  const courseSlices: readonly ChartSliceItem[] = assignedSubjects.map((s, idx) => ({
    name: s.name,
    value: assignments.filter((a) => a.subjectId === s.id).length || 1,
    color: palette[(idx + 2) % palette.length],
  }));

  const isLoadingMetrics = isAssignmentsLoading || isStudentsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Assigned Grades"
          value={assignedGrades.length}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Total Classes"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Grade Level Distribution"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "Grades", value: 1, color: "#059669" }]}
          centerLabel="Levels"
          centerValue={assignedGrades.length}
          isLoading={isAssignmentsLoading}
        />
        <DashboardDonutCard
          title="Class Sections per Grade"
          slices={gradeSectionSlices.length > 0 ? gradeSectionSlices : [{ name: "Sections", value: 1, color: "#10B981" }]}
          centerLabel="Sections"
          centerValue={assignedSections.length}
          isLoading={isAssignmentsLoading}
        />
        <DashboardDonutCard
          title="Student Gender Ratio"
          slices={studentGenderSlices}
          centerLabel="Ratio"
          centerValue={`${maleStudents}:${femaleStudents}`}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Curriculum Courses"
          slices={courseSlices.length > 0 ? courseSlices : [{ name: "Courses", value: 1, color: "#6366f1" }]}
          centerLabel="Courses"
          centerValue={assignedSubjects.length}
          isLoading={isAssignmentsLoading}
        />
      </div>
    </div>
  );
}
