import { z } from "zod";

export const otpPurposeEnum = z.enum([
  "LOGIN_2FA",
  "EMAIL_VERIFICATION",
  "EMAIL_CHANGE",
  "PASSWORD_RESET",
  "INVITATION_ACCEPT",
]);

const deviceTypeEnum = z.enum(["WEB", "MOBILE", "TABLET", "DESKTOP_APP"]);

export const loginSchema = z
  .object({
    email: z.string().trim().min(1).max(255).optional(),
    identifier: z.string().trim().min(1).max(255).optional(),
    password: z.string().min(1),
    deviceId: z.string().optional(),
    deviceType: deviceTypeEnum.optional().default("WEB"),
  })
  .refine((data) => data.email || data.identifier, {
    message: "Email or username is required",
    path: ["email"],
  });

export const verifyOtpSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().trim().optional(),
  identifier: z.string().trim().optional(),
  otp: z.string().trim().length(6).regex(/^\d{6}$/),
  purpose: otpPurposeEnum.optional().default("LOGIN_2FA"),
});

export const resendOtpSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().trim().optional(),
  identifier: z.string().trim().optional(),
  purpose: otpPurposeEnum.optional().default("LOGIN_2FA"),
});

export const firstLoginSetupSchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().trim().email().optional(),
    username: z.string().trim().optional(),
    identifier: z.string().trim().optional(),
    otp: z.string().trim().length(6).regex(/^\d{6}$/).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(128),
  })
  .refine(
    (data) =>
      Boolean(data.email && data.otp) ||
      Boolean((data.username || data.identifier) && data.currentPassword) ||
      Boolean(data.userId && data.currentPassword) ||
      Boolean(data.userId && data.otp),
    {
      message:
        "Please provide either your email with verification code, or your username with temporary password.",
      path: ["newPassword"],
    }
  );

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
export type ResendOtpDto = z.infer<typeof resendOtpSchema>;
export type FirstLoginSetupDto = z.infer<typeof firstLoginSetupSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ResetPasswordRequestDto = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirmDto = z.infer<typeof resetPasswordConfirmSchema>;
