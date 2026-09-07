"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { ExamContextTable } from "@/features/question-bank";

export default function ExamContextsPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <ExamContextTable />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
