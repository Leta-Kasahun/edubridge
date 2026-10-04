"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentBookmarksView } from "@/features/assessments";

export default function BookmarksPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <StudentBookmarksView />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
