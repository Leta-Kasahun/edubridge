export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    VERIFY_OTP: "/verify-otp",
    FIRST_LOGIN_SETUP: "/first-login-setup",
    RESET_PASSWORD: "/reset-password",
  },
  ONBOARDING: {
    TEACHER: "/onboarding/teacher",
    STUDENT: "/onboarding/student",
  },
  DASHBOARD: "/dashboard",
  TEACHER: {
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
    QUALIFICATIONS: "/dashboard/qualifications",
  },
  STUDENT: {
    DASHBOARD: "/dashboard",
    PROFILE: "/dashboard/profile",
  },
  SCHOOLS: "/dashboard/schools-mng",
  TEACHERS: "/dashboard/provisioning/teachers",
  STAFF_QUALIFICATIONS: "/dashboard/staff-qualifications",
  ACADEMIC: {
    BASE: "/dashboard/academic",
    YEARS: "/dashboard/academic/years",
    GRADES: "/dashboard/academic/grades",
    SECTIONS: "/dashboard/academic/sections",
    SUBJECTS: "/dashboard/academic/subjects",
    ASSIGNMENTS_STUDENTS: "/dashboard/academic/assignments/students",
    ASSIGNMENTS_TEACHERS: "/dashboard/academic/assignments/teachers",
  },
  PROVISIONING: {
    BASE: "/dashboard/provisioning",
    TEACHERS: "/dashboard/provisioning/teachers",
    STUDENTS: "/dashboard/provisioning/students",
  },
  PROFILE: "/dashboard/profile",
  QUALIFICATIONS: "/dashboard/qualifications",
  CURRICULUM: {
    BASE: "/dashboard/curriculum",
    CURRICULA: "/dashboard/curriculum/curricula",
    STRUCTURE: "/dashboard/curriculum/structure",
    IMPORT: "/dashboard/curriculum/import",
  },
  SETTINGS: {
    BASE: "/dashboard/settings",
    SECURITY: "/dashboard/settings/security",
    ROLES: "/dashboard/settings/roles",
    PREFERENCES: "/dashboard/settings/preferences",
  },
} as const;

export type Routes = typeof ROUTES;
