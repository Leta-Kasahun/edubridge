"use client";

import {
  AssessmentStatus,
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_STATUS_COLORS,
} from "@/shared/constants/assessment.constants";

interface AssessmentStatusBadgeProps {
  readonly status: AssessmentStatus;
  readonly className?: string;
}

export function AssessmentStatusBadge({
  status,
  className = "",
}: AssessmentStatusBadgeProps) {
  const label = ASSESSMENT_STATUS_LABELS[status] || status;
  const colors = ASSESSMENT_STATUS_COLORS[status] || ASSESSMENT_STATUS_COLORS.DRAFT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label}
    </span>
  );
}
