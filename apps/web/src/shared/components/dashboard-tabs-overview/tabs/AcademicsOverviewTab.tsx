"use client";

import { useAcademicYears, useActiveAcademicYear } from "@/features/academic/academic-years/hooks/useAcademicYears";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { DashboardMetricCard } from "../DashboardMetricCard";
import { DashboardDonutCard } from "../DashboardDonutCard";
import type { ChartSliceItem } from "../types";

export function AcademicsOverviewTab() {
  const { data: yearsData, isLoading: isYearsLoading } = useAcademicYears();
  const { data: activeYearData, isLoading: isActiveYearLoading } = useActiveAcademicYear();
  const { data: gradesData, isLoading: isGradesLoading } = useGrades();
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections();
  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjects();

  const yearsList = yearsData?.data ?? [];
  const gradesList = gradesData ?? [];
  const sectionsList = sectionsData ?? [];
  const subjectsList = subjectsData ?? [];

  const activeSections = sectionsList.filter((s) => s.status === "ACTIVE").length;
  const inactiveSections = Math.max(0, sectionsList.length - activeSections);

  const activeGrades = gradesList.filter((g) => g.isActive).length;

  const sectionStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active Sections", value: activeSections, color: "#10B981" },
    { name: "Archived / Inactive", value: inactiveSections, color: "#94a3b8" },
  ];

  const colors = ["#10B981", "#0EA5E9", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const gradeSlices: readonly ChartSliceItem[] = gradesList.slice(0, 6).map((g, idx) => ({
    name: `Grade ${g.level}`,
    value: g.sectionCount || 1,
    color: colors[idx % colors.length],
  }));

  const activeYearsCount = yearsList.filter((y) => y.status === "ACTIVE").length || 1;
  const archivedYearsCount = Math.max(0, yearsList.length - activeYearsCount);

  const academicYearSlices: readonly ChartSliceItem[] = [
    { name: "Active Session", value: activeYearsCount, color: "#10B981" },
    { name: "Past Sessions", value: archivedYearsCount, color: "#94a3b8" },
  ];

  const activeSubjects = subjectsList.filter((s) => s.isActive).length;
  const inactiveSubjects = Math.max(0, subjectsList.length - activeSubjects);

  const subjectTypeSlices: readonly ChartSliceItem[] = [
    { name: "Active Courses", value: activeSubjects, color: "#10B981" },
    { name: "Inactive / Draft", value: inactiveSubjects, color: "#f59e0b" },
  ];

  const isLoadingMetrics = isYearsLoading || isActiveYearLoading || isGradesLoading || isSectionsLoading || isSubjectsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Active Session"
          value={activeYearData?.name ?? "Current"}
          detail={activeYearData?.status === "ACTIVE" ? "Current active calendar" : "Academic session"}
          isLoading={isActiveYearLoading}
        />
        <DashboardMetricCard
          title="Grade Levels"
          value={gradesList.length}
          detail={`${activeGrades} operational grades`}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Total Sections"
          value={sectionsList.length}
          detail={`${activeSections} active class sections`}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Registered Courses"
          value={subjectsList.length}
          detail={`${activeSubjects} active curriculum courses`}
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Section Capacity Split"
          slices={sectionStatusSlices}
          centerLabel="Sections"
          centerValue={sectionsList.length}
          isLoading={isSectionsLoading}
        />
        <DashboardDonutCard
          title="Grade Distribution"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "Grades", value: gradesList.length, color: "#059669" }]}
          centerLabel="Levels"
          centerValue={gradesList.length}
          isLoading={isGradesLoading}
        />
        <DashboardDonutCard
          title="Course Status"
          slices={subjectTypeSlices}
          centerLabel="Courses"
          centerValue={subjectsList.length}
          isLoading={isSubjectsLoading}
        />
        <DashboardDonutCard
          title="Academic Sessions"
          slices={academicYearSlices}
          centerLabel="Years"
          centerValue={yearsList.length}
          isLoading={isYearsLoading}
        />
      </div>
    </div>
  );
}
