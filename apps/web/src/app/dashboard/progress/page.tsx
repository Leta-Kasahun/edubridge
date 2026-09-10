"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { StudentProgressView } from "@/features/assessments";

export default function StudentProgressPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <StudentProgressView />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
