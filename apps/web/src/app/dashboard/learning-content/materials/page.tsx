"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ContentListView, StudentMaterialsView } from "@/features/learning-content";
import { useAuthStore } from "@/stores/auth.store";

export default function LearningMaterialsPage() {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.roles?.includes("STUDENT");

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        {isStudent ? <StudentMaterialsView /> : <ContentListView />}
      </DashboardLayout>
    </RoleGuard>
  );
}
