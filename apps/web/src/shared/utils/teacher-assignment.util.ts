import {
  TeacherAssignmentRoleType,
  TeacherAssignmentStatusType,
  TEACHER_ASSIGNMENT_ROLE_LABELS,
  TEACHER_ASSIGNMENT_STATUS_LABELS,
  TEACHER_HIGH_LOAD_THRESHOLD,
} from "../constants/teacher-assignment.constants";

export function formatTeacherAssignmentRole(role: TeacherAssignmentRoleType): string {
  return TEACHER_ASSIGNMENT_ROLE_LABELS[role] || role;
}

export function formatTeacherAssignmentStatus(status: TeacherAssignmentStatusType): string {
  return TEACHER_ASSIGNMENT_STATUS_LABELS[status] || status;
}

export function getTeacherLoadBadgeClass(load: number): string {
  if (load >= TEACHER_HIGH_LOAD_THRESHOLD) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
  }
  return "bg-muted text-foreground border border-border";
}
