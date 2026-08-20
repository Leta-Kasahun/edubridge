import { AuthUser } from "@/shared/types";

export type OtpPurpose =
  | "LOGIN_2FA"
  | "EMAIL_VERIFICATION"
  | "EMAIL_CHANGE"
  | "PASSWORD_RESET"
  | "INVITATION_ACCEPT";

export type DeviceType = "WEB" | "MOBILE" | "TABLET" | "DESKTOP_APP";

export interface LoginPayload {
  email?: string;
  identifier?: string;
  password: string;
  deviceId?: string;
  deviceType?: DeviceType;
}

export interface VerifyOtpPayload {
  userId?: string;
  email?: string;
  identifier?: string;
  otp: string;
  purpose?: OtpPurpose;
}

export interface ResendOtpPayload {
  userId?: string;
  email?: string;
  identifier?: string;
  purpose?: OtpPurpose;
}

export interface FirstLoginSetupPayload {
  userId?: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface GoogleAuthPayload {
  googleId: string;
  email: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequestPayload {
  identifier: string;
}

export interface ResetPasswordConfirmPayload {
  token: string;
  newPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface AuthResponseData {
  tokens?: AuthTokens;
  user?: AuthUser;
  requiresOtp?: boolean;
  requiresFirstLoginSetup?: boolean;
  userId?: string;
  purpose?: OtpPurpose;
  message?: string;
}
