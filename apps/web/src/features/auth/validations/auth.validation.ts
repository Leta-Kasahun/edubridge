import { z } from "zod";

export interface SecurityPolicy {
  minPasswordLength: number;
  maxPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export const defaultSecurityPolicy: SecurityPolicy = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email cannot exceed 255 characters")
  .email("Invalid email address")
  .toLowerCase();

export const createPasswordSchema = (policy: Partial<SecurityPolicy> = {}) => {
  const p = { ...defaultSecurityPolicy, ...policy };
  let schema = z
    .string()
    .min(1, "Password is required")
    .min(p.minPasswordLength, `Minimum ${p.minPasswordLength} characters`)
    .max(p.maxPasswordLength, `Maximum ${p.maxPasswordLength} characters`);

  if (p.requireUppercase) schema = schema.regex(/[A-Z]/, "Must include an uppercase letter");
  if (p.requireLowercase) schema = schema.regex(/[a-z]/, "Must include a lowercase letter");
  if (p.requireNumbers) schema = schema.regex(/\d/, "Must include a number");
  if (p.requireSpecialChars) {
    schema = schema.regex(/[^A-Za-z0-9]/, "Must include a special character");
  }

  return schema;
};

export const passwordSchema = createPasswordSchema();
export const otpSchema = z.string().trim().length(6, "Must be 6 digits").regex(/^\d{6}$/, "Digits only");

export const loginValidationSchema = z.object({
  email: z.string().trim().min(1, "Email or Username is required").max(255),
  password: z.string().min(1, "Password is required"),
});

export const verifyOtpValidationSchema = z.object({ otp: otpSchema });
export const resendOtpValidationSchema = z.object({
  email: emailSchema.optional(),
  userId: z.string().uuid().optional(),
});

export const createFirstLoginSchema = (policy?: Partial<SecurityPolicy>) =>
  z
    .object({
      email: emailSchema,
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: createPasswordSchema(policy),
      confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
      message: "New password must differ from current",
      path: ["newPassword"],
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

export const createChangePasswordSchema = (policy?: Partial<SecurityPolicy>) =>
  z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: createPasswordSchema(policy),
      confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((d) => d.newPassword !== d.currentPassword, {
      message: "New password must differ from current",
      path: ["newPassword"],
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

export const firstLoginSetupValidationSchema = createFirstLoginSchema();
export const changePasswordValidationSchema = createChangePasswordSchema();

export const resetPasswordRequestValidationSchema = z.object({ email: emailSchema });
export const resetPasswordConfirmValidationSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export interface PasswordRule {
  id: string;
  label: string;
  passed: boolean;
}

export interface PasswordStrengthResult {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  rules: PasswordRule[];
  isComplete: boolean;
}

export function calculatePasswordStrength(
  password: string,
  policy: Partial<SecurityPolicy> = {}
): PasswordStrengthResult {
  const p = { ...defaultSecurityPolicy, ...policy };
  const rules: PasswordRule[] = [
    {
      id: "length",
      label: `${p.minPasswordLength}-${p.maxPasswordLength} chars`,
      passed: password.length >= p.minPasswordLength && password.length <= p.maxPasswordLength,
    },
    ...(p.requireUppercase ? [{ id: "upper", label: "Uppercase (A-Z)", passed: /[A-Z]/.test(password) }] : []),
    ...(p.requireLowercase ? [{ id: "lower", label: "Lowercase (a-z)", passed: /[a-z]/.test(password) }] : []),
    ...(p.requireNumbers ? [{ id: "number", label: "Number (0-9)", passed: /\d/.test(password) }] : []),
    ...(p.requireSpecialChars ? [{ id: "special", label: "Symbol (!@#...)", passed: /[^A-Za-z0-9]/.test(password) }] : []),
  ];

  const passed = rules.filter((r) => r.passed).length;
  const score = password.length === 0 ? 0 : Math.min(4, Math.floor((passed / Math.max(1, rules.length)) * 4));
  const colors = ["#DC2626", "#EA580C", "#D97706", "#0284C7", "#059669"];
  const labels: PasswordStrengthResult["label"][] = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return {
    score,
    label: labels[score],
    color: colors[score],
    rules,
    isComplete: passed === rules.length && password.length > 0,
  };
}

export type LoginFormData = z.infer<typeof loginValidationSchema>;
export type VerifyOtpFormData = z.infer<typeof verifyOtpValidationSchema>;
export type ResendOtpFormData = z.infer<typeof resendOtpValidationSchema>;
export type FirstLoginSetupFormData = z.infer<typeof firstLoginSetupValidationSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordValidationSchema>;
export type ResetPasswordRequestFormData = z.infer<typeof resetPasswordRequestValidationSchema>;
export type ResetPasswordConfirmFormData = z.infer<typeof resetPasswordConfirmValidationSchema>;
