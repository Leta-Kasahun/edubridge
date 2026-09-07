"use client";

import { use } from "react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { QuestionListView } from "@/features/question-bank";

interface BankQuestionsPageProps {
  readonly params: Promise<{ bankId: string }>;
}

export default function BankQuestionsPage({ params }: BankQuestionsPageProps) {
  const resolvedParams = use(params);

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "STUDENT"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <QuestionListView bankId={resolvedParams.bankId} />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
