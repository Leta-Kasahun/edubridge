import {
  EXAM_SCOPE_LABELS,
  EXAM_SCOPE_COLORS,
} from "../constants/question-bank.constants";

export function formatExamScope(scope: string): string {
  return EXAM_SCOPE_LABELS[scope as keyof typeof EXAM_SCOPE_LABELS] ?? scope;
}

export function formatExamContextTitle(
  name: string,
  year?: number | null,
  scope?: string | null
): string {
  const parts = [name];
  if (year) {
    parts.push(`${year} E.C.`);
  }
  if (scope && scope in EXAM_SCOPE_LABELS) {
    parts.push(`(${EXAM_SCOPE_LABELS[scope as keyof typeof EXAM_SCOPE_LABELS]})`);
  }
  return parts.join(" ");
}

export function getExamScopeBadgeColor(scope: string): string {
  return EXAM_SCOPE_COLORS[scope as keyof typeof EXAM_SCOPE_COLORS] ?? EXAM_SCOPE_COLORS.GENERAL;
}
