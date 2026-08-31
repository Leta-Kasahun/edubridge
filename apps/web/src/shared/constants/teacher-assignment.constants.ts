export const TEACHER_ASSIGNMENT_ROLE = {
  HOMEROOM_TEACHER: "HOMEROOM_TEACHER",
  SUBJECT_TEACHER: "SUBJECT_TEACHER",
  OTHER: "OTHER",
} as const;

export type TeacherAssignmentRoleType =
  (typeof TEACHER_ASSIGNMENT_ROLE)[keyof typeof TEACHER_ASSIGNMENT_ROLE];

export const TEACHER_ASSIGNMENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export type TeacherAssignmentStatusType =
  (typeof TEACHER_ASSIGNMENT_STATUS)[keyof typeof TEACHER_ASSIGNMENT_STATUS];

export const TEACHER_ASSIGNMENT_ROLE_LABELS: Record<
  TeacherAssignmentRoleType,
  string
> = {
  HOMEROOM_TEACHER: "Homeroom Teacher",
  SUBJECT_TEACHER: "Subject Teacher",
  OTHER: "Other",
};

export const TEACHER_ASSIGNMENT_STATUS_LABELS: Record<
  TeacherAssignmentStatusType,
  string
> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  COMPLETED: "Completed",
};

export const TEACHER_HIGH_LOAD_THRESHOLD = 6;
