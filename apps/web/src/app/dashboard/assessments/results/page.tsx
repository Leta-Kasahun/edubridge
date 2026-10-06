"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { AssessmentGlobalResultsView } from "@/features/evaluations-feedback";

export default function AssessmentResultsPage() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <AssessmentGlobalResultsView />
      </DashboardLayout>
    </RoleGuard>
  );
}
