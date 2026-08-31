import {
  StudentEnrollmentStatusType,
  STUDENT_ENROLLMENT_STATUS_LABELS,
} from "../constants/student-assignment.constants";

export function formatEnrollmentStatus(status: StudentEnrollmentStatusType): string {
  return STUDENT_ENROLLMENT_STATUS_LABELS[status] || status;
}

export function getEnrollmentStatusBadgeClass(status: StudentEnrollmentStatusType): string {
  switch (status) {
    case "ACTIVE":
      return "bg-muted text-foreground border border-border";
    case "COMPLETED":
      return "bg-muted/60 text-muted-foreground border border-border/60";
    case "TRANSFERRED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
    case "WITHDRAWN":
      return "bg-destructive/10 text-destructive border border-destructive/20";
    case "SUSPENDED":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}
