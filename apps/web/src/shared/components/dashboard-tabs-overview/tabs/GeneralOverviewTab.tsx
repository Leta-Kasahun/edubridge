"use client";

import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
import { useTeachers } from "@/features/provisioning/teacher/hooks/useTeacherProvisioning";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { DashboardMetricCard } from "../DashboardMetricCard";
import { DashboardDonutCard } from "../DashboardDonutCard";
import type { ChartSliceItem } from "../types";

export function GeneralOverviewTab() {
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ limit: 100 });
  const { data: teachersData, isLoading: isTeachersLoading } = useTeachers({ limit: 100 });
  const { data: gradesData, isLoading: isGradesLoading } = useGrades();
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections();

  const studentsList = studentsData?.data ?? [];
  const teachersList = teachersData?.data ?? [];
  const gradesList = gradesData ?? [];
  const sectionsList = sectionsData ?? [];

  const totalStudents = studentsData?.pagination?.total ?? studentsList.length;
  const totalTeachers = teachersData?.pagination?.total ?? teachersList.length;
  const totalGrades = gradesList.length;
  const totalSections = sectionsList.length;

  const activeStudentsCount = studentsList.filter(
    (s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE"
  ).length;
  const pendingStudentsCount = studentsList.filter(
    (s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE"
  ).length;
  const otherStudentsCount = Math.max(0, studentsList.length - activeStudentsCount - pendingStudentsCount);

  const maleStudents = studentsList.filter((s) => s.gender === "MALE").length;
  const femaleStudents = studentsList.filter((s) => s.gender === "FEMALE").length;

  const activeTeachersCount = teachersList.filter((t) => t.teacherStatus === "ACTIVE" || t.status === "ACTIVE").length;
  const pendingTeachersCount = teachersList.filter((t) => t.status === "PENDING_FIRST_LOGIN" || !t.emailVerified).length;
  const otherTeachersCount = Math.max(0, teachersList.length - activeTeachersCount - pendingTeachersCount);

  const maleTeachers = teachersList.filter((t) => t.gender === "MALE").length;
  const femaleTeachers = teachersList.filter((t) => t.gender === "FEMALE").length;

  const studentStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeStudentsCount, color: "#10B981" },
    { name: "Pending", value: pendingStudentsCount, color: "#f59e0b" },
    { name: "Other", value: otherStudentsCount, color: "#94a3b8" },
  ];

  const studentGenderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleStudents, color: "#0EA5E9" },
    { name: "Female", value: femaleStudents, color: "#F97316" },
  ];

  const teacherStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeTeachersCount, color: "#10B981" },
    { name: "Pending", value: pendingTeachersCount, color: "#f59e0b" },
    { name: "Inactive", value: otherTeachersCount, color: "#94a3b8" },
  ];

  const teacherGenderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleTeachers, color: "#0EA5E9" },
    { name: "Female", value: femaleTeachers, color: "#F97316" },
  ];

  const isLoadingMetrics = isStudentsLoading || isTeachersLoading || isGradesLoading || isSectionsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          detail="Enrolled student accounts"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Total Teachers"
          value={totalTeachers.toLocaleString()}
          detail="Active teaching staff"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Grade Levels"
          value={totalGrades.toString()}
          detail="Curriculum grade tiers"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Active Sections"
          value={totalSections.toString()}
          detail="Classroom sections"
          isLoading={isLoadingMetrics}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Student Status Distribution"
          slices={studentStatusSlices}
          centerLabel="Students"
          centerValue={studentsList.length}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Student Gender Split"
          slices={studentGenderSlices}
          centerLabel="Ratio"
          centerValue={`${maleStudents}:${femaleStudents}`}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Teacher Status Split"
          slices={teacherStatusSlices}
          centerLabel="Teachers"
          centerValue={teachersList.length}
          isLoading={isTeachersLoading}
        />
        <DashboardDonutCard
          title="Teacher Gender Split"
          slices={teacherGenderSlices}
          centerLabel="Teachers"
          centerValue={teachersList.length}
          isLoading={isTeachersLoading}
        />
      </div>
    </div>
  );
}
