"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ContentImportManager } from "@/features/learning-content";

export default function LearningContentImportPage() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <ContentImportManager />
      </DashboardLayout>
    </RoleGuard>
  );
}
