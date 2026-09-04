export const CONTENT_TYPES = [
  "TEXT",
  "LESSON",
  "NOTE",
  "VIDEO",
  "PDF",
  "IMAGE",
  "LINK",
  "TEXTBOOK",
  "REFERENCE_BOOK",
  "WORKSHEET",
  "EXERCISE",
  "PAST_EXAM_PAPER",
  "TEACHER_GUIDE",
  "STUDY_GUIDE",
] as const;

export type ContentTypeEnum = (typeof CONTENT_TYPES)[number];

export const CONTENT_SCOPES = [
  "SUBJECT",
  "GRADE_SUBJECT",
  "UNIT",
  "TOPIC",
] as const;

export type ContentScopeEnum = (typeof CONTENT_SCOPES)[number];

export const CONTENT_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type ContentStatusEnum = (typeof CONTENT_STATUSES)[number];

export const CONTENT_SOURCE_TYPES = [
  "TEACHER",
  "SYSTEM",
  "AI",
] as const;

export type ContentSourceTypeEnum = (typeof CONTENT_SOURCE_TYPES)[number];

export const DEFAULT_CONTENT_PAGE_LIMIT = 20;
export const MAX_CONTENT_PAGE_LIMIT = 100;

export const MAX_ATTACHMENT_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_CONTENT = 20;

export const ALLOWED_ATTACHMENT_CATEGORIES = [
  "pdf",
  "document",
  "spreadsheet",
  "image",
  "video",
  "audio",
] as const;
