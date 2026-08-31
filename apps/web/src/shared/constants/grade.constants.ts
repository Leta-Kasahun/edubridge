import { FilterOption } from "@/shared/components/TableToolbar";

export const DEFAULT_SECONDARY_GRADE_LEVELS = [7, 8, 9, 10, 11, 12] as const;

export const GRADE_LEVEL_CATEGORY_MAP: Record<number, string> = {
  7: "Elementary (7–8)",
  8: "Elementary (7–8)",
  9: "High School (9–10)",
  10: "High School (9–10)",
  11: "High School (11–12)",
  12: "High School (11–12)",
};

export const GRADE_STREAMS = ["NONE", "NATURAL_SCIENCE", "SOCIAL_SCIENCE"] as const;
export type GradeStreamType = (typeof GRADE_STREAMS)[number];

export const GRADE_STREAM_LABELS: Record<GradeStreamType, string> = {
  NONE: "General (No Stream)",
  NATURAL_SCIENCE: "Natural Science",
  SOCIAL_SCIENCE: "Social Science",
};

export const GRADE_AVAILABLE_STREAMS_MAP: Record<number, readonly GradeStreamType[]> = {
  7: ["NONE"],
  8: ["NONE"],
  9: ["NONE"],
  10: ["NONE"],
  11: ["NONE", "NATURAL_SCIENCE", "SOCIAL_SCIENCE"],
  12: ["NONE", "NATURAL_SCIENCE", "SOCIAL_SCIENCE"],
};

export const GRADE_STATUS_OPTIONS: readonly FilterOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
] as const;

export const GRADE_CATEGORY_FILTER_OPTIONS: readonly FilterOption[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Elementary (7–8)", value: "ELEMENTARY" },
  { label: "High School (9–12)", value: "HIGH_SCHOOL" },
] as const;
