import {
  CurriculumScope,
  CurriculumStatus,
  CurriculumVersionStatus,
} from "@/features/curriculum/curricula/types/curriculum.types";

export function formatCurriculumCode(code: string): string {
  return code.trim().toUpperCase();
}

export function formatCurriculumScopeLabel(scope: CurriculumScope): string {
  switch (scope) {
    case "SYSTEM":
      return "National Standard";
    case "TENANT":
      return "School Custom";
  }
}

export function formatCurriculumStatusLabel(
  status: CurriculumStatus | CurriculumVersionStatus
): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "DRAFT":
      return "Draft";
    case "ARCHIVED":
      return "Archived";
  }
}

export function formatEffectiveDateRange(
  from?: string | null,
  to?: string | null
): string {
  if (!from && !to) return "Indefinite";
  const fromStr = from ? new Date(from).toLocaleDateString() : "Start";
  const toStr = to ? new Date(to).toLocaleDateString() : "Indefinite";
  return `${fromStr} — ${toStr}`;
}
