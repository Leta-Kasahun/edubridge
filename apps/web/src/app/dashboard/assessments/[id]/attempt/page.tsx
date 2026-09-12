"use client";

import { use, useState } from "react";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { useAssessment } from "@/features/assessments/hooks/useAssessments";
import { useStartAttempt } from "@/features/assessments/hooks/useAssessmentAttempt";
import {
  StudentAssessmentEntryView,
  StudentAssessmentRunnerView,
} from "@/features/assessments/components/student";
import { StudentActiveAttemptSession } from "@/features/assessments/types/assessment.types";

interface AssessmentAttemptPageProps {
  readonly params: Promise<{ id: string }>;
}

export default function AssessmentAttemptPage({ params }: AssessmentAttemptPageProps) {
  const resolvedParams = use(params);
  const [activeSession, setActiveSession] = useState<StudentActiveAttemptSession | null>(null);

  const {
    data: assessment,
    isLoading: isLoadingAssessment,
    error: assessmentError,
  } = useAssessment(resolvedParams.id);

  const startAttemptMutation = useStartAttempt();

  const handleStartAttempt = async () => {
    if (!assessment) return;

    const assignmentId = assessment.assignments?.[0]?.id || assessment.id;

    const session = await startAttemptMutation.mutateAsync({
      assessmentId: assessment.id,
      assignmentId,
    });
    setActiveSession(session);
  };

  if (activeSession) {
    return (
      <RoleGuard allowedRoles={["STUDENT", "TEACHER", "SCHOOL_ADMIN"]}>
        <StudentAssessmentRunnerView
          session={activeSession}
          onRetake={handleStartAttempt}
        />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["STUDENT", "TEACHER", "SCHOOL_ADMIN"]}>
      {isLoadingAssessment ? (
        <div className="min-h-screen flex items-center justify-center p-16 bg-background">
          <LoadingSpinner size={32} />
        </div>
      ) : assessmentError || !assessment ? (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-2xl w-full">
            <ErrorAlert message="Failed to load assessment details. Please try again." />
          </div>
        </div>
      ) : (
        <StudentAssessmentEntryView
          assessment={assessment}
          assignmentId={assessment.assignments?.[0]?.id || assessment.id}
          onStart={handleStartAttempt}
          isLoading={startAttemptMutation.isPending}
        />
      )}
    </RoleGuard>
  );
}
