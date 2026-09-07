"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { QuestionBankTable } from "@/features/question-bank";

export default function QuestionBanksListPage() {
  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <QuestionBankTable />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
