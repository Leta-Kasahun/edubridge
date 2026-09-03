export const CURRICULUM_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
] as const;

export type CurriculumStatusType = (typeof CURRICULUM_STATUSES)[number];

export const CURRICULUM_VERSION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
] as const;

export type CurriculumVersionStatusType =
  (typeof CURRICULUM_VERSION_STATUSES)[number];

export const CURRICULUM_SCOPES = ["TENANT", "SYSTEM"] as const;

export type CurriculumScopeType = (typeof CURRICULUM_SCOPES)[number];

export const CURRICULUM_CODE_REGEX = /^[A-Za-z0-9_-]{2,50}$/;

export const DEFAULT_CURRICULUM_PAGE_LIMIT = 20;

export const MAX_CURRICULUM_PAGE_LIMIT = 100;
