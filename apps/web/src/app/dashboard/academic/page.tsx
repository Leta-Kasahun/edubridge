"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { AcademicYearsView } from "@/features/academic";

export default function AcademicDashboardPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <AcademicYearsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
