"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ContentListView } from "@/features/learning-content";

export default function LearningMaterialsPage() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <ContentListView />
      </DashboardLayout>
    </RoleGuard>
  );
}
