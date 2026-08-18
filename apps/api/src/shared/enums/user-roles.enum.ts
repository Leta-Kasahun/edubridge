export const SystemRole = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type SystemRole = (typeof SystemRole)[keyof typeof SystemRole];
