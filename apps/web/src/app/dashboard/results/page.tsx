"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentResultsListView } from "@/features/assessments";

export default function StudentResultsPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <StudentResultsListView />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
