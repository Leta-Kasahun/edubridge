"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { TeacherQualificationsView } from "@/features/teacher-profile";

export default function QualificationsPage() {
  return (
    <DashboardLayout>
      <TeacherQualificationsView />
    </DashboardLayout>
  );
}
