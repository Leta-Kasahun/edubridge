import { SectionStatusType } from "../constants/section.constants";

export function formatCapacityUtilization(
  studentCount: number,
  capacity: number | null
): string {
  if (capacity === null || capacity === undefined) {
    return `${studentCount} Students`;
  }
  return `${studentCount} / ${capacity} Students`;
}

export function getCapacityPercentage(
  studentCount: number,
  capacity: number | null
): number | null {
  if (!capacity || capacity <= 0) return null;
  return Math.min(100, Math.round((studentCount / capacity) * 100));
}

export function getCapacityBadgeClass(
  studentCount: number,
  capacity: number | null
): string {
  if (!capacity) return "bg-muted text-muted-foreground";
  const ratio = studentCount / capacity;
  if (ratio >= 1) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  if (ratio >= 0.8) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
}

export function getSectionStatusBadgeClass(status: SectionStatusType): string {
  switch (status) {
    case "ACTIVE":
      return "bg-[#064E3B]/20 text-[#6EE7B7] border-[#064E3B]/30";
    case "INACTIVE":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    case "ARCHIVED":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
}
