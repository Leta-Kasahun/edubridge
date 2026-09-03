"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { CurriculaView } from "@/features/curriculum";

export default function CurriculumCurriculaPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "PLATFORM_ADMIN"]}>
      <DashboardLayout>
        <CurriculaView />
      </DashboardLayout>
    </RoleGuard>
  );
}
