export const APP_ROLES = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];
