"use client";

import { useMemo } from "react";
import { useMyTeacherAssignments } from "@/features/academic/assignments/teacher";
import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
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

  const activeStudents = scopedStudents.filter(
    (s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE"
  ).length;
  const pendingStudents = scopedStudents.filter(
    (s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE"
  ).length;
  const otherStudents = Math.max(0, totalStudents - activeStudents - pendingStudents);

  const studentStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeStudents, color: "#10B981" },
    { name: "Pending", value: pendingStudents, color: "#f59e0b" },
    { name: "Other", value: otherStudents, color: "#94a3b8" },
  ];

  const studentGenderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleStudents, color: "#0EA5E9" },
    { name: "Female", value: femaleStudents, color: "#F97316" },
  ];

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
