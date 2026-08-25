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
  },
  DASHBOARD: "/dashboard",
  SCHOOLS: "/dashboard/schools-mng",
  TEACHERS: "/dashboard/teachers-mng",
  PROFILE: "/dashboard/profile",
  SETTINGS: {
    BASE: "/dashboard/settings",
    SECURITY: "/dashboard/settings/security",
    ROLES: "/dashboard/settings/roles",
    PREFERENCES: "/dashboard/settings/preferences",
  },
} as const;

export type Routes = typeof ROUTES;
