export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
    VERIFY_OTP: "/verify-otp",
    FIRST_LOGIN_SETUP: "/first-login-setup",
    RESET_PASSWORD: "/reset-password",
  },
  DASHBOARD: "/dashboard",
} as const;

export type Routes = typeof ROUTES;
