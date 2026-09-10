"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { AssessmentListView, StudentAssessmentsView } from "@/features/assessments";
import { useAuthStore } from "@/stores/auth.store";

export default function AssessmentsPage() {
  const isStudent = useAuthStore((s) => s.user?.roles?.includes("STUDENT") && !s.user?.roles?.includes("TEACHER") && !s.user?.roles?.includes("SCHOOL_ADMIN"));

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {isStudent ? <StudentAssessmentsView /> : <AssessmentListView />}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
