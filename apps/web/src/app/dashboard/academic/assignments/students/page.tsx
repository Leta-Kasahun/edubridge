"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentAssignmentsView } from "@/features/academic";

export default function AcademicStudentAssignmentsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <StudentAssignmentsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
