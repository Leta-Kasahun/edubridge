"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StructureView } from "@/features/curriculum/structure";

export default function CurriculumStructurePage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "PLATFORM_ADMIN"]}>
      <DashboardLayout>
        <StructureView />
      </DashboardLayout>
    </RoleGuard>
  );
}
