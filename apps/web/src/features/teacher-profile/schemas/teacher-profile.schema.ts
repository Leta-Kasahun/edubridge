import { z } from "zod";
import { isValidDob } from "@/shared/utils/date.util";

export const addressSchema = z.object({
  regionId: z.string().max(255).optional().nullable().or(z.literal("")),
  zoneId: z.string().max(255).optional().nullable().or(z.literal("")),
  woredaId: z.string().max(255).optional().nullable().or(z.literal("")),
  kebeleId: z.string().max(255).optional().nullable().or(z.literal("")),
  cityId: z.string().max(255).optional().nullable().or(z.literal("")),
  subCityId: z.string().max(255).optional().nullable().or(z.literal("")),
  specificLocation: z.string().max(255).optional().nullable().or(z.literal("")),
});

export const completeTeacherProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  middleName: z
    .string()
    .trim()
    .min(2, "Middle name must be at least 2 characters")
    .max(50, "Middle name must not exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Please select a valid gender",
  }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((dob) => isValidDob(dob, 18, 100), {
      message: "Teacher must be at least 18 years old",
    }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  photoUrl: z.string().trim().max(10000000).optional().or(z.literal("")),
  address: addressSchema.optional().nullable(),
});

export const updateTeacherProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  middleName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().min(2).max(50).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z
    .string()
    .refine((dob) => !dob || isValidDob(dob, 18, 100), {
      message: "Teacher must be at least 18 years old",
    })
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  nationality: z.string().trim().max(100).optional().or(z.literal("")),
  photoUrl: z.string().trim().max(10000000).optional().or(z.literal("")),
  address: addressSchema.optional().nullable(),
});

export type CompleteTeacherProfileFormData = z.infer<typeof completeTeacherProfileSchema>;
export type UpdateTeacherProfileFormData = z.infer<typeof updateTeacherProfileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
