"use client";

import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { QuestionBankTable, StudentQuestionBanksView } from "@/features/question-bank";
import { useAuthStore } from "@/stores/auth.store";

export default function QuestionBanksListPage() {
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.roles?.includes("STUDENT");

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          {isStudent ? <StudentQuestionBanksView /> : <QuestionBankTable />}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
