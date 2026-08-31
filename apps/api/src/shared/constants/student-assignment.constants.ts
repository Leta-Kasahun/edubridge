export const STUDENT_ENROLLMENT_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  TRANSFERRED: "TRANSFERRED",
  WITHDRAWN: "WITHDRAWN",
  SUSPENDED: "SUSPENDED",
} as const;

export type StudentEnrollmentStatusType =
  (typeof STUDENT_ENROLLMENT_STATUS)[keyof typeof STUDENT_ENROLLMENT_STATUS];

export const STUDENT_ENROLLMENT_STATUS_LABELS: Record<
  StudentEnrollmentStatusType,
  string
> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  TRANSFERRED: "Transferred",
  WITHDRAWN: "Withdrawn",
  SUSPENDED: "Suspended",
};
