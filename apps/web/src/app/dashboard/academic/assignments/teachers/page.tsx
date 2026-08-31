"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { TeacherAssignmentsView } from "@/features/academic";

export default function AcademicTeacherAssignmentsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <TeacherAssignmentsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
