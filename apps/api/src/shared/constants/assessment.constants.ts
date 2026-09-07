export const ASSESSMENT_TYPES = [
  "PRACTICE",
  "QUIZ",
  "ASSIGNMENT",
  "EXAM",
  "DIAGNOSTIC",
  "MOCK_EXAM",
] as const;
export type AssessmentTypeEnum = (typeof ASSESSMENT_TYPES)[number];

export const ASSESSMENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
] as const;
export type AssessmentStatusEnum = (typeof ASSESSMENT_STATUSES)[number];

export const GRADING_MODES = ["AUTOMATIC", "MANUAL", "MIXED"] as const;
export type GradingModeEnum = (typeof GRADING_MODES)[number];

export const ASSESSMENT_ASSIGNMENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "CLOSED",
  "ARCHIVED",
] as const;
export type AssessmentAssignmentStatusEnum =
  (typeof ASSESSMENT_ASSIGNMENT_STATUSES)[number];

export const ATTEMPT_STATUSES = [
  "IN_PROGRESS",
  "SUBMITTED",
  "EXPIRED",
  "GRADING",
  "GRADED",
  "ABANDONED",
] as const;
export type AttemptStatusEnum = (typeof ATTEMPT_STATUSES)[number];

export const ANSWER_STATUSES = [
  "UNANSWERED",
  "ANSWERED",
  "FLAGGED",
  "GRADED",
] as const;
export type AnswerStatusEnum = (typeof ANSWER_STATUSES)[number];

export const EVIDENCE_SOURCE_TYPES = [
  "ASSESSMENT",
  "PRACTICE",
  "EXAM",
  "MOCK_EXAM",
  "MANUAL",
] as const;
export type EvidenceSourceTypeEnum = (typeof EVIDENCE_SOURCE_TYPES)[number];

export const MASTERY_LEVELS = [
  "NOT_STARTED",
  "DEVELOPING",
  "PROFICIENT",
  "MASTERED",
] as const;
export type MasteryLevelEnum = (typeof MASTERY_LEVELS)[number];

export const ASSESSMENT_DEFAULTS = {
  DEFAULT_MAX_ATTEMPTS: 1,
  DEFAULT_TIME_LIMIT_MINUTES: 45,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;
