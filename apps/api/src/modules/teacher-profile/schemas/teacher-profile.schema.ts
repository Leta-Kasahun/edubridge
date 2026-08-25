import { z } from "zod";
import { isValidDob } from "../../../shared/utils/date.util.js";

export const addressSchema = z.object({
  regionId: z.string().max(150).optional().nullable(),
  zoneId: z.string().max(150).optional().nullable(),
  woredaId: z.string().max(150).optional().nullable(),
  kebeleId: z.string().max(150).optional().nullable(),
  cityId: z.string().max(150).optional().nullable(),
  subCityId: z.string().max(150).optional().nullable(),
  specificLocation: z.string().max(255).optional().nullable(),
});

export const completeTeacherProfileSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50),
  middleName: z.string().trim().min(2, "Middle name must be at least 2 characters").max(50),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(50),
  gender: z.enum(["MALE", "FEMALE"], {
    error: "Gender must be either MALE or FEMALE",
  }),
  dateOfBirth: z
    .string()
    .or(z.date())
    .pipe(z.coerce.date())
    .refine((dob) => isValidDob(dob, 18, 100), {
      message: "Teacher must be at least 18 years old",
    }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable(),
  nationality: z.string().trim().max(100).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  address: addressSchema.optional().nullable(),
});

export const updateTeacherProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  middleName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().min(2).max(50).optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z
    .string()
    .or(z.date())
    .pipe(z.coerce.date())
    .refine((dob) => isValidDob(dob, 18, 100), {
      message: "Teacher must be at least 18 years old",
    })
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable(),
  nationality: z.string().trim().max(100).optional().nullable(),
  photoUrl: z.string().trim().max(500).optional().nullable(),
  address: addressSchema.optional().nullable(),
});

export type CompleteTeacherProfileInput = z.infer<typeof completeTeacherProfileSchema>;
export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
