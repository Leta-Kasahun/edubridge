import { z } from "zod";

export const teacherGenderSchema = z.enum(["MALE", "FEMALE"], {
  error: "Please select a gender",
});

export const teacherStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "TRANSFERRED",
  "RESIGNED",
  "SUSPENDED",
]);

export const singleTeacherInviteFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  middleName: z
    .string()
    .trim()
    .min(1, "Father / Middle name is required")
    .max(100, "Middle name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Grandfather / Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  gender: teacherGenderSchema,
  email: z
    .string()
    .trim()
    .min(1, "Email address is required for invitation")
    .email("Invalid email address")
    .toLowerCase(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  employeeCode: z
    .string()
    .trim()
    .max(50, "Employee code cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

export const singleTeacherDirectFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  middleName: z
    .string()
    .trim()
    .min(1, "Father / Middle name is required")
    .max(100, "Middle name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Grandfather / Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  gender: teacherGenderSchema,
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  employeeCode: z
    .string()
    .trim()
    .max(50, "Employee code cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

export const singleTeacherProvisionFormSchema = z
  .object({
    method: z.enum(["INVITATION", "DIRECT_CREDENTIALS"]),
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100, "First name cannot exceed 100 characters"),
    middleName: z
      .string()
      .trim()
      .min(1, "Father / Middle name is required")
      .max(100, "Middle name cannot exceed 100 characters"),
    lastName: z
      .string()
      .trim()
      .min(1, "Grandfather / Last name is required")
      .max(100, "Last name cannot exceed 100 characters"),
    gender: teacherGenderSchema,
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase()
      .optional()
      .or(z.literal("")),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    employeeCode: z
      .string()
      .trim()
      .max(50, "Employee code cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.method === "INVITATION") {
      if (!data.email || data.email.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email address is required for invitation provisioning",
          path: ["email"],
        });
      }
    }
  });

export const teacherProfileEditFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  middleName: z
    .string()
    .trim()
    .min(1, "Father / Middle name is required")
    .max(100, "Middle name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Grandfather / Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  gender: teacherGenderSchema,
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  status: teacherStatusSchema.optional(),
});

export type SingleTeacherInviteFormData = z.infer<
  typeof singleTeacherInviteFormSchema
>;
export type SingleTeacherDirectFormData = z.infer<
  typeof singleTeacherDirectFormSchema
>;
export type SingleTeacherProvisionFormData = z.infer<
  typeof singleTeacherProvisionFormSchema
>;
export type TeacherProfileEditFormData = z.infer<
  typeof teacherProfileEditFormSchema
>;
