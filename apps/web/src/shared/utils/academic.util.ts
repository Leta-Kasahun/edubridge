export const ACCOUNT_STATUS_FILTER_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending first login", value: "PENDING_FIRST_LOGIN" },
  { label: "Locked", value: "LOCKED" },
  { label: "Suspended", value: "SUSPENDED" },
] as const;

export function formatGradeLabel(level: number): string {
  return `Grade ${level}`;
}

export function formatSectionTitle(
  sectionName: string,
  studentCount?: number
): string {
  const count = studentCount ?? 0;
  return `${sectionName} — ${count} ${count === 1 ? "student" : "students"}`;
}

export function formatStudentAccountStatus(status: string): string {
  switch (status) {
    case "PENDING_FIRST_LOGIN":
      return "Pending first login";
    case "ACTIVE":
      return "Active";
    case "LOCKED":
      return "Locked";
    case "SUSPENDED":
      return "Suspended";
    case "DEACTIVATED":
      return "Deactivated";
    default:
      return status;
  }
}

export function getStudentStatusBadgeColor(status: string): {
  dotClass: string;
  textClass: string;
} {
  switch (status) {
    case "PENDING_FIRST_LOGIN":
      return {
        dotClass: "bg-amber-500",
        textClass: "text-amber-500 dark:text-amber-400",
      };
    case "ACTIVE":
      return {
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-600 dark:text-emerald-400",
      };
    case "LOCKED":
    case "SUSPENDED":
    case "DEACTIVATED":
      return {
        dotClass: "bg-rose-500",
        textClass: "text-rose-600 dark:text-rose-400",
      };
    default:
      return {
        dotClass: "bg-muted-foreground",
        textClass: "text-muted-foreground",
      };
  }
}
