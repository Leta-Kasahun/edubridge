import { z } from "zod";
import { isValidDob } from "../../../shared/utils/date.util.js";

export const genderEnum = z.enum(["MALE", "FEMALE"], {
  error: "Gender must be either MALE or FEMALE",
});

export const contactRelationshipEnum = z.enum([
  "FATHER",
  "MOTHER",
  "GUARDIAN",
  "OTHER",
]);

export const addressSchema = z.object({
  regionId: z.string().max(150).optional().nullable(),
  zoneId: z.string().max(150).optional().nullable(),
  woredaId: z.string().max(150).optional().nullable(),
  kebeleId: z.string().max(150).optional().nullable(),
  cityId: z.string().max(150).optional().nullable(),
  subCityId: z.string().max(150).optional().nullable(),
  specificLocation: z.string().max(255).optional().nullable(),
});

export const studentContactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Contact full name is required")
    .max(150, "Full name cannot exceed 150 characters"),
  relationship: contactRelationshipEnum,
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid phone number format"),
  alternativePhoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{9,20}$/, "Invalid alternative phone number format")
    .optional()
    .nullable()
    .or(z.literal("")),
  isPrimary: z.boolean().optional().default(true),
  isEmergencyContact: z.boolean().optional().default(false),
  address: addressSchema.optional().nullable(),
});

export const completeStudentProfileSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(50),
  middleName: z.string().trim().min(2, "Middle name must be at least 2 characters").max(50),
  lastName: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  gender: genderEnum,
  dateOfBirth: z
    .string()
    .or(z.date())
    .pipe(z.coerce.date())
    .refine((dob) => isValidDob(dob, 3, 100), {
      message: "Student must be at least 3 years old",
    }),
  nationality: z.string().trim().max(100).optional().nullable(),
  photoUrl: z.string().trim().max(10000000).optional().nullable(),
  address: addressSchema.optional().nullable(),
  contacts: z.array(studentContactSchema).optional().default([]),
});

export const updateStudentProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  middleName: z.string().trim().min(2).max(50).optional(),
  lastName: z.string().trim().max(50).optional().nullable().or(z.literal("")),
  gender: genderEnum.optional(),
  dateOfBirth: z
    .string()
    .or(z.date())
    .pipe(z.coerce.date())
    .refine((dob) => isValidDob(dob, 3, 100), {
      message: "Student must be at least 3 years old",
    })
    .optional()
    .nullable(),
  nationality: z.string().trim().max(100).optional().nullable(),
  photoUrl: z.string().trim().max(10000000).optional().nullable(),
  address: addressSchema.optional().nullable(),
  contacts: z.array(studentContactSchema).optional(),
});

export type CompleteStudentProfileInput = z.infer<typeof completeStudentProfileSchema>;
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type StudentContactInput = z.infer<typeof studentContactSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
