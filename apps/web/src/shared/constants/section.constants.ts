export const SECTION_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type SectionStatusType = (typeof SECTION_STATUS)[keyof typeof SECTION_STATUS];

export const SECTION_STATUS_LABELS: Readonly<Record<SectionStatusType, string>> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export const SECTION_CAPACITY_LIMITS = {
  DEFAULT: 50,
  MIN: 1,
  MAX: 200,
} as const;

export const STANDARD_SECTION_NAMES = [
  "A", "B", "C", "D", "E", "F", "G", "H"
] as const;
