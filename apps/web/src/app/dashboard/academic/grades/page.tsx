"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { GradesView } from "@/features/academic";

export default function AcademicGradesPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <GradesView />
      </DashboardLayout>
    </RoleGuard>
  );
}
