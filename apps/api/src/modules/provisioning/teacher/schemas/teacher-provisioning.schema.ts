import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE"]);

export const teacherProvisioningMethodEnum = z.enum([
  "INVITATION",
  "DIRECT_CREDENTIALS",
]);

export const teacherRowValidationSchema = z.object({
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
  gender: genderEnum,
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

export const provisionTeacherInviteSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
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
  gender: genderEnum,
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

export const provisionTeacherDirectSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
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
  gender: genderEnum,
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

export const provisionTeacherSchema = z
  .object({
    method: teacherProvisioningMethodEnum,
    tenantId: z.string().uuid("Invalid tenant ID").optional(),
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
    gender: genderEnum,
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
          message: "Email address is required when method is INVITATION",
          path: ["email"],
        });
      }
    }
  });

export const bulkProvisionTeachersSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  method: teacherProvisioningMethodEnum.default("INVITATION"),
  teachers: z
    .array(teacherRowValidationSchema)
    .min(1, "At least one teacher record is required")
    .max(500, "Cannot bulk provision more than 500 teachers in a single batch"),
  sendNotifications: z.boolean().optional().default(true),
});

export const bulkTeacherCsvSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  method: teacherProvisioningMethodEnum.default("INVITATION"),
  csvContent: z.string().min(1, "CSV file content is required"),
  sendNotifications: z.boolean().optional().default(true),
});
