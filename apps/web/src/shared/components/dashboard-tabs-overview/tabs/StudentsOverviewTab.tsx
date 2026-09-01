"use client";

import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { DashboardMetricCard } from "../DashboardMetricCard";
import { DashboardDonutCard } from "../DashboardDonutCard";
import type { ChartSliceItem } from "../types";

export function StudentsOverviewTab() {
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ limit: 100 });
  const { data: gradesData, isLoading: isGradesLoading } = useGrades();

  const studentsList = studentsData?.data ?? [];
  const totalStudents = studentsData?.pagination?.total ?? studentsList.length;

  const activeStudents = studentsList.filter(
    (s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE"
  ).length;

  const pendingStudents = studentsList.filter(
    (s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE"
  ).length;

  const suspendedStudents = studentsList.filter(
    (s) => s.status === "SUSPENDED" || s.studentStatus === "SUSPENDED"
  ).length;

  const maleStudents = studentsList.filter((s) => s.gender === "MALE").length;
  const femaleStudents = studentsList.filter((s) => s.gender === "FEMALE").length;

  const enrollmentSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeStudents, color: "#059669" },
    { name: "Pending", value: pendingStudents, color: "#f59e0b" },
    { name: "Suspended", value: suspendedStudents, color: "#e11d48" },
  ];

  const genderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleStudents, color: "#0284c7" },
    { name: "Female", value: femaleStudents, color: "#e11d48" },
  ];

  const grades = gradesData ?? [];
  const gradeColors = ["#059669", "#0284c7", "#6366f1", "#f59e0b", "#e11d48", "#14b8a6"];
  const gradeSlices: readonly ChartSliceItem[] = grades.slice(0, 6).map((g, index) => {
    const count = studentsList.filter((s) => s.enrollment?.gradeLevel === g.level).length;
    return {
      name: `Grade ${g.level}`,
      value: count,
      color: gradeColors[index % gradeColors.length],
    };
  });

  const activationSlices: readonly ChartSliceItem[] = [
    { name: "Logged In", value: activeStudents, color: "#059669" },
    { name: "First Login Pending", value: pendingStudents, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Enrolled Students"
          value={totalStudents.toLocaleString()}
          detail="Total registered student records"
          isLoading={isStudentsLoading}
        />
        <DashboardMetricCard
          title="Active Students"
          value={activeStudents.toLocaleString()}
          detail="Fully operational accounts"
          isLoading={isStudentsLoading}
        />
        <DashboardMetricCard
          title="Pending First Login"
          value={pendingStudents.toLocaleString()}
          detail="Awaiting initial access"
          isLoading={isStudentsLoading}
        />
        <DashboardMetricCard
          title="Suspended Accounts"
          value={suspendedStudents.toLocaleString()}
          detail="Restricted portal access"
          isLoading={isStudentsLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Enrollment Status"
          slices={enrollmentSlices}
          centerLabel="Total"
          centerValue={studentsList.length}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Gender Representation"
          slices={genderSlices}
          centerLabel="Total"
          centerValue={studentsList.length}
          isLoading={isStudentsLoading}
        />
        <DashboardDonutCard
          title="Grade Level Distribution"
          slices={gradeSlices.length > 0 ? gradeSlices : [{ name: "General", value: studentsList.length, color: "#059669" }]}
          centerLabel="Grades"
          centerValue={grades.length}
          isLoading={isStudentsLoading || isGradesLoading}
        />
        <DashboardDonutCard
          title="Account Onboarding Split"
          slices={activationSlices}
          centerLabel="Active"
          centerValue={activeStudents}
          isLoading={isStudentsLoading}
        />
      </div>
    </div>
  );
}
