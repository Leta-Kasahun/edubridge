export const ASSESSMENT_TYPES = [
  "PRACTICE",
  "QUIZ",
  "ASSIGNMENT",
  "EXAM",
  "DIAGNOSTIC",
  "MOCK_EXAM",
] as const;
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
] as const;
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];

export const GRADING_MODES = ["AUTOMATIC", "MANUAL", "MIXED"] as const;
export type GradingMode = (typeof GRADING_MODES)[number];

export const ATTEMPT_STATUSES = [
  "IN_PROGRESS",
  "SUBMITTED",
  "EXPIRED",
  "GRADING",
  "GRADED",
  "ABANDONED",
] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  PRACTICE: "Practice Test",
  QUIZ: "Quiz",
  ASSIGNMENT: "Assignment",
  EXAM: "Formal Examination",
  DIAGNOSTIC: "Diagnostic Assessment",
  MOCK_EXAM: "Mock National Exam",
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ACTIVE: "Active",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const GRADING_MODE_LABELS: Record<GradingMode, string> = {
  AUTOMATIC: "Automatic (Instant)",
  MANUAL: "Manual Teacher Review",
  MIXED: "Mixed (Auto + Review)",
};

export const ATTEMPT_STATUS_LABELS: Record<AttemptStatus, string> = {
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  EXPIRED: "Time Expired",
  GRADING: "Under Review",
  GRADED: "Graded",
  ABANDONED: "Abandoned",
};

export const ASSESSMENT_STATUS_COLORS: Record<
  AssessmentStatus,
  { bg: string; text: string; border: string }
> = {
  DRAFT: {
    bg: "bg-slate-500/10 dark:bg-slate-400/10",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/20 dark:border-slate-400/20",
  },
  PUBLISHED: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/20 dark:border-emerald-400/20",
  },
  ACTIVE: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/20 dark:border-blue-400/20",
  },
  CLOSED: {
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/20 dark:border-amber-400/20",
  },
  ARCHIVED: {
    bg: "bg-rose-500/10 dark:bg-rose-400/10",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/20 dark:border-rose-400/20",
  },
};
