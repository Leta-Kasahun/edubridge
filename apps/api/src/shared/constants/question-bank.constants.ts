export const QUESTION_TYPES = [
  "MCQ",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "NUMERIC",
  "MATCHING",
  "ORDERING",
] as const;
export type QuestionTypeEnum = (typeof QUESTION_TYPES)[number];

export const QUESTION_STATUSES = [
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
] as const;
export type QuestionStatusEnum = (typeof QUESTION_STATUSES)[number];

export const QUESTION_SOURCE_TYPES = [
  "TEACHER",
  "SYSTEM",
  "AI",
  "IMPORTED",
] as const;
export type QuestionSourceTypeEnum = (typeof QUESTION_SOURCE_TYPES)[number];

export const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"] as const;
export type DifficultyLevelEnum = (typeof DIFFICULTY_LEVELS)[number];

export const QUESTION_GRADING_STATUSES = [
  "AUTO_GRADED",
  "MANUAL_GRADING",
  "GRADED",
] as const;
export type QuestionGradingStatusEnum = (typeof QUESTION_GRADING_STATUSES)[number];

export const QUESTION_BANK_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type QuestionBankStatusEnum = (typeof QUESTION_BANK_STATUSES)[number];

export const EXAM_SCOPES = [
  "GENERAL",
  "SCHOOL",
  "REGIONAL",
  "NATIONAL",
] as const;
export type ExamScopeEnum = (typeof EXAM_SCOPES)[number];

export const EXAM_CONTEXT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ExamContextStatusEnum = (typeof EXAM_CONTEXT_STATUSES)[number];

export const QUESTION_BANK_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const QUESTION_UPLOAD_LIMITS = {
  MAX_PDF_SIZE_BYTES: 52428800,
  MAX_IMAGE_SIZE_BYTES: 10485760,
  ALLOWED_MIME_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
} as const;
