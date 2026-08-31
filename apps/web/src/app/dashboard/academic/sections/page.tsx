"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { SectionsView } from "@/features/academic";

export default function AcademicSectionsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN"]}>
      <DashboardLayout>
        <SectionsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
