import {
  GRADE_LEVEL_CATEGORY_MAP,
  GRADE_STREAM_LABELS,
  GRADE_AVAILABLE_STREAMS_MAP,
  GradeStreamType,
} from "@/shared/constants";

export function formatGradeName(level: number): string {
  return `Grade ${level}`;
}

export function getGradeCategoryLabel(level: number): string {
  return GRADE_LEVEL_CATEGORY_MAP[level] || `Level ${level}`;
}

export function getGradeAvailableStreams(level: number): readonly GradeStreamType[] {
  return GRADE_AVAILABLE_STREAMS_MAP[level] || ["NONE"];
}

export function formatGradeStreamLabel(stream: GradeStreamType): string {
  return GRADE_STREAM_LABELS[stream] || "General";
}
