"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { QuestionListView } from "@/features/question-bank";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/constants/routes";

interface BankQuestionsPageProps {
  readonly params: Promise<{ bankId: string }>;
}

export default function BankQuestionsPage({ params }: BankQuestionsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isStudent = Boolean(
    user?.roles?.includes("STUDENT") &&
      !user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );

  useEffect(() => {
    if (isStudent) {
      router.replace(ROUTES.STUDENT.EXAMS);
    }
  }, [isStudent, router]);

  return (
    <RoleGuard allowedRoles={["SCHOOL_ADMIN", "TEACHER", "SYSTEM_ADMIN"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <QuestionListView bankId={resolvedParams.bankId} />
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}

