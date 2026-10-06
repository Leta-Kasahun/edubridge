"use client";

import { use } from "react";
import { DashboardLayout } from "@/shared/components/layouts";
import { RoleGuard } from "@/shared/components/RoleGuard";
import { AssessmentDetailView } from "@/features/assessments";

interface AssessmentDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export default function AssessmentDetailPage({ params }: AssessmentDetailPageProps) {
  const resolvedParams = use(params);

  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMIN", "SCHOOL_ADMIN", "TEACHER"]}>
      <DashboardLayout>
        <AssessmentDetailView id={resolvedParams.id} />
      </DashboardLayout>
    </RoleGuard>
  );
}
