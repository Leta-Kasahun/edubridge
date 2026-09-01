"use client";

import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherClassesTab() {
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections();
  const { data: gradesData, isLoading: isGradesLoading } = useGrades();
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ limit: 100 });

  const sectionsList = sectionsData ?? [];
  const gradesList = gradesData ?? [];
  const studentsList = studentsData?.data ?? [];

  const activeSections = sectionsList.filter((s) => s.status === "ACTIVE").length;
  const totalStudents = studentsData?.pagination?.total ?? studentsList.length;

  const colors = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const gradeSlices: readonly ChartSliceItem[] = gradesList.slice(0, 6).map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: g.sectionCount || 1,
    color: colors[idx % colors.length],
  }));

  const sectionStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active Classes", value: activeSections, color: "#059669" },
    { name: "Archived / Other", value: Math.max(0, sectionsList.length - activeSections), color: "#94a3b8" },
  ];

  const maleStudents = studentsList.filter((s) => s.gender === "MALE").length;
  const femaleStudents = studentsList.filter((s) => s.gender === "FEMALE").length;

  const genderSlices: readonly ChartSliceItem[] = [
    { name: "Male Pupils", value: maleStudents, color: "#0284c7" },
    { name: "Female Pupils", value: femaleStudents, color: "#e11d48" },
  ];

  const studentStatusSlices: readonly ChartSliceItem[] = [
    {
      name: "Enrolled Active",
      value: studentsList.filter((s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE").length,
      color: "#059669",
    },
    {
      name: "Pending Setup",
      value: studentsList.filter((s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE").length,
      color: "#f59e0b",
    },
  ];

  const isLoadingMetrics = isSectionsLoading || isGradesLoading || isStudentsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Active Classes"
          value={activeSections}
          detail="Operational section rosters"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          detail="Classroom roll size"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Grade Tiers"
          value={gradesList.length}
          detail="Curriculum levels covered"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Average Class Size"
          value={sectionsList.length > 0 ? Math.round(totalStudents / sectionsList.length) : 0}
          detail="Students per section"
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Grade Distribution"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "Grades", value: gradesList.length, color: "#059669" }]}
          centerLabel="Levels"
          centerValue={gradesList.length}
          isLoading={isGradesLoading}
        />
        <DashboardDonutCard
          title="Class Status Split"
          slices={sectionStatusSlices}
          centerLabel="Sections"
          centerValue={sectionsList.length}
          isLoading={isSectionsLoading}
        />
        <DashboardDonutCard
          title="Student Gender Split"
          slices={genderSlices}
          centerLabel="Pupils"
          centerValue={studentsList.length}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Enrollment Status"
          slices={studentStatusSlices}
          centerLabel="Enrolled"
          centerValue={studentsList.length}
          isLoading={isStudentsLoading}
        />
      </div>
    </div>
  );
}
