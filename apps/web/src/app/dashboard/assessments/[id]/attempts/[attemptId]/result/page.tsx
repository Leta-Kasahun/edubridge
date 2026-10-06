"use client";

import { use } from "react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  useAttemptResult,
  StudentAssessmentCompletedView,
} from "@/features/evaluations-feedback";

interface AssessmentAttemptResultPageProps {
  readonly params: Promise<{ id: string; attemptId: string }>;
}

export default function AssessmentAttemptResultPage({
  params,
}: AssessmentAttemptResultPageProps) {
  const resolvedParams = use(params);

  const {
    data: result,
    isLoading,
    error,
  } = useAttemptResult(resolvedParams.id, resolvedParams.attemptId);

  return (
    <RoleGuard allowedRoles={["STUDENT", "TEACHER", "SCHOOL_ADMIN"]}>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex justify-center p-16">
            <LoadingSpinner />
          </div>
        ) : error || !result ? (
          <div className="max-w-2xl mx-auto py-12">
            <ErrorAlert message="Failed to load attempt result. Please try again." />
          </div>
        ) : (
          <StudentAssessmentCompletedView attempt={result} />
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
