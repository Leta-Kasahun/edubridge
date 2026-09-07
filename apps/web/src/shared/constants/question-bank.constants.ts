export const QUESTION_TYPE_LABELS = {
  MCQ: "Multiple Choice",
  TRUE_FALSE: "True / False",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  NUMERIC: "Numeric",
  MATCHING: "Matching",
  ORDERING: "Ordering",
} as const;

export const DIFFICULTY_LEVEL_LABELS = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
} as const;

export const DIFFICULTY_LEVEL_COLORS = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  MEDIUM: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  HARD: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800",
} as const;

export const QUESTION_STATUS_LABELS = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;

export const QUESTION_STATUS_COLORS = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  REVIEW: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  APPROVED: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  PUBLISHED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  ARCHIVED: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
} as const;

export const EXAM_SCOPE_LABELS = {
  GENERAL: "General Practice",
  SCHOOL: "School Exam",
  REGIONAL: "Regional Exam",
  NATIONAL: "National Exam",
} as const;

export const EXAM_SCOPE_COLORS = {
  NATIONAL: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  REGIONAL: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  SCHOOL: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  GENERAL: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
} as const;

export const QUESTION_UPLOAD_ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";
export const MAX_QUESTION_FILE_MB = 50;
