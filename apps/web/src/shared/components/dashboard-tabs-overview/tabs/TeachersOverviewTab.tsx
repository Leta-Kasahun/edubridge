"use client";

import { useTeachers } from "@/features/provisioning/teacher/hooks/useTeacherProvisioning";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications/hooks/useStaffQualifications";
import { DashboardMetricCard } from "../DashboardMetricCard";
import { DashboardDonutCard } from "../DashboardDonutCard";
import type { ChartSliceItem } from "../types";

export function TeachersOverviewTab() {
  const { data: teachersData, isLoading: isTeachersLoading } = useTeachers({ limit: 100 });
  const { data: staffDirectory, isLoading: isStaffLoading } = useStaffQualificationsDirectory();

  const teachersList = teachersData?.data ?? [];
  const totalTeachers = teachersData?.pagination?.total ?? teachersList.length;

  const activeTeachers = teachersList.filter(
    (t) => t.teacherStatus === "ACTIVE" || t.status === "ACTIVE"
  ).length;

  const verifiedTeachers = teachersList.filter((t) => t.emailVerified).length;
  const unverifiedTeachers = Math.max(0, teachersList.length - verifiedTeachers);

  const maleTeachers = teachersList.filter((t) => t.gender === "MALE").length;
  const femaleTeachers = teachersList.filter((t) => t.gender === "FEMALE").length;

  const suspendedTeachers = teachersList.filter(
    (t) => t.teacherStatus === "SUSPENDED" || t.status === "SUSPENDED"
  ).length;

  const otherTeachers = Math.max(0, teachersList.length - activeTeachers - suspendedTeachers);

  const statusSlices: readonly ChartSliceItem[] = [
    { name: "Active", value: activeTeachers, color: "#059669" },
    { name: "Pending", value: otherTeachers, color: "#f59e0b" },
    { name: "Suspended", value: suspendedTeachers, color: "#e11d48" },
  ];

  const genderSlices: readonly ChartSliceItem[] = [
    { name: "Male", value: maleTeachers, color: "#0284c7" },
    { name: "Female", value: femaleTeachers, color: "#e11d48" },
  ];

  const verificationSlices: readonly ChartSliceItem[] = [
    { name: "Verified", value: verifiedTeachers, color: "#059669" },
    { name: "Pending Verify", value: unverifiedTeachers, color: "#f59e0b" },
  ];

  const staffItems = staffDirectory?.data ?? [];
  const bscCount = staffItems.filter((s) => s.highestLevel === "BACHELOR").length;
  const mscCount = staffItems.filter((s) => s.highestLevel === "MASTER").length;
  const phdCount = staffItems.filter((s) => s.highestLevel === "DOCTORATE").length;
  const diplomaCount = staffItems.filter((s) => s.highestLevel === "DIPLOMA" || s.highestLevel === "CERTIFICATE").length;
  const otherDegreeCount = Math.max(0, staffItems.length - bscCount - mscCount - phdCount - diplomaCount);

  const qualificationSlices: readonly ChartSliceItem[] = staffItems.length > 0 ? [
    { name: "Master's Degree", value: mscCount, color: "#6366f1" },
    { name: "Bachelor's Degree", value: bscCount, color: "#0284c7" },
    { name: "Doctorate (PhD)", value: phdCount, color: "#8b5cf6" },
    { name: "Diploma / Cert", value: diplomaCount, color: "#059669" },
    { name: "Other", value: otherDegreeCount, color: "#94a3b8" },
  ] : [
    { name: "Teachers Roster", value: teachersList.length, color: "#059669" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Total Teachers"
          value={totalTeachers.toLocaleString()}
          detail="Registered teaching faculty"
          isLoading={isTeachersLoading}
        />
        <DashboardMetricCard
          title="Active Teachers"
          value={activeTeachers.toLocaleString()}
          detail="Assigned and operational"
          isLoading={isTeachersLoading}
        />
        <DashboardMetricCard
          title="Verified Accounts"
          value={verifiedTeachers.toLocaleString()}
          detail="Email address verified"
          isLoading={isTeachersLoading}
        />
        <DashboardMetricCard
          title="Pending Verification"
          value={unverifiedTeachers.toLocaleString()}
          detail="Awaiting verification check"
          isLoading={isTeachersLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardDonutCard
          title="Teacher Status"
          slices={statusSlices}
          centerLabel="Teachers"
          centerValue={teachersList.length}
          isLoading={isTeachersLoading}
        />
        <DashboardDonutCard
          title="Teacher Gender Ratio"
          slices={genderSlices}
          centerLabel="Total"
          centerValue={teachersList.length}
          isLoading={isTeachersLoading}
        />
        <DashboardDonutCard
          title="Email Verification Split"
          slices={verificationSlices}
          centerLabel="Verified"
          centerValue={verifiedTeachers}
          isLoading={isTeachersLoading}
        />
        <DashboardDonutCard
          title="Teacher Qualifications"
          slices={qualificationSlices}
          centerLabel="Profiles"
          centerValue={staffItems.length || teachersList.length}
          isLoading={isStaffLoading || isTeachersLoading}
        />
      </div>
    </div>
  );
}
