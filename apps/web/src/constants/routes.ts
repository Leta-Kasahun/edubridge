export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    VERIFY_OTP: "/verify-otp",
    FIRST_LOGIN_SETUP: "/first-login-setup",
    RESET_PASSWORD: "/reset-password",
  },
  DASHBOARD: "/dashboard",
  SCHOOLS: "/dashboard/schools",
  SETTINGS: {
    BASE: "/dashboard/settings",
    SECURITY: "/dashboard/settings/security",
    ROLES: "/dashboard/settings/roles",
    PREFERENCES: "/dashboard/settings/preferences",
  },
} as const;

export type Routes = typeof ROUTES;
