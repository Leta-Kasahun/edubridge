"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { SubjectsView } from "@/features/academic";

export default function AcademicSubjectsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <SubjectsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
