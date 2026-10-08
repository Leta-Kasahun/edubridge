"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentBookmarksView } from "@/features/bookmarks";

export default function StudentBookmarksPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <StudentBookmarksView />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
