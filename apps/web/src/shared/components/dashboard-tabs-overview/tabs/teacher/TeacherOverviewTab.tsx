"use client";

import { useMyTeacherProfile } from "@/features/teacher-profile/hooks/useTeacherProfile";
import { useStudents } from "@/features/provisioning/student/hooks/useStudents";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { DashboardMetricCard } from "../../DashboardMetricCard";
import { DashboardDonutCard } from "../../DashboardDonutCard";
import type { ChartSliceItem } from "../../types";

export function TeacherOverviewTab() {
  const { data: profile, isLoading: isProfileLoading } = useMyTeacherProfile();
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({ limit: 100 });
  const { data: sectionsData, isLoading: isSectionsLoading } = useSections();
  const { data: subjectsData, isLoading: isSubjectsLoading } = useSubjects();

  const studentsList = studentsData?.data ?? [];
  const sectionsList = sectionsData ?? [];
  const subjectsList = subjectsData ?? [];

  const totalStudents = studentsData?.pagination?.total ?? studentsList.length;
  const activeSections = sectionsList.filter((s) => s.status === "ACTIVE").length;
  const activeSubjects = subjectsList.filter((s) => s.isActive).length;

  const maleStudents = studentsList.filter((s) => s.gender === "MALE").length;
  const femaleStudents = studentsList.filter((s) => s.gender === "FEMALE").length;

  const activeStudents = studentsList.filter((s) => s.status === "ACTIVE" || s.studentStatus === "ACTIVE").length;
  const pendingStudents = studentsList.filter((s) => s.status === "PENDING_FIRST_LOGIN" || s.studentStatus === "INACTIVE").length;
  const otherStudents = Math.max(0, studentsList.length - activeStudents - pendingStudents);

  const studentStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeStudents, color: "#059669" },
    { name: "Pending", value: pendingStudents, color: "#f59e0b" },
    { name: "Other", value: otherStudents, color: "#94a3b8" },
  ];

  const studentGenderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleStudents, color: "#0284c7" },
    { name: "Female", value: femaleStudents, color: "#e11d48" },
  ];

  const sectionStatusSlices: readonly ChartSliceItem[] = [
    { name: "Active Classes", value: activeSections, color: "#059669" },
    { name: "Other Classes", value: Math.max(0, sectionsList.length - activeSections), color: "#94a3b8" },
  ];

  const subjectSlices: readonly ChartSliceItem[] = [
    { name: "Active Courses", value: activeSubjects, color: "#059669" },
    { name: "Other Courses", value: Math.max(0, subjectsList.length - activeSubjects), color: "#f59e0b" },
  ];

  const isLoadingMetrics = isProfileLoading || isStudentsLoading || isSectionsLoading || isSubjectsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Assigned Classes"
          value={sectionsList.length}
          detail={`${activeSections} active classrooms`}
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Classroom Students"
          value={totalStudents.toLocaleString()}
          detail="Enrolled pupil roster"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Active Courses"
          value={activeSubjects}
          detail="Assigned curriculum subjects"
          isLoading={isLoadingMetrics}
        />
        <DashboardMetricCard
          title="Profile Status"
          value={profile?.status ?? "Active"}
          detail={profile?.emailVerified ? "Email verified" : "Pending verification"}
          isLoading={isProfileLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Student Status Split"
          slices={studentStatusSlices}
          centerLabel="Students"
          centerValue={studentsList.length}
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
          title="Assigned Classrooms"
          slices={sectionStatusSlices}
          centerLabel="Sections"
          centerValue={sectionsList.length}
          isLoading={isSectionsLoading}
        />
        <DashboardDonutCard
          title="Course Allocation"
          slices={subjectSlices}
          centerLabel="Courses"
          centerValue={subjectsList.length}
          isLoading={isSubjectsLoading}
        />
      </div>
    </div>
  );
}
