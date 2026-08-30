import { z } from "zod";

const qualificationLevelEnum = z.enum([
  "CERTIFICATE",
  "DIPLOMA",
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
  "OTHER",
]);

const yearFieldSchema = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  const num = typeof val === "number" ? val : Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().int().min(1900, "Year must be valid").max(2100, "Year cannot be in far future").nullable().optional());

export const createTeacherQualificationSchema = z
  .object({
    level: qualificationLevelEnum,
    fieldOfStudy: z
      .string()
      .trim()
      .min(2, "Field of study must be at least 2 characters")
      .max(150, "Field of study must not exceed 150 characters"),
    institution: z
      .string()
      .trim()
      .max(200, "Institution name must not exceed 200 characters")
      .nullable()
      .optional(),
    startYear: yearFieldSchema,
    graduationYear: yearFieldSchema,
    documentUrl: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startYear && data.graduationYear) {
        return data.startYear <= data.graduationYear;
      }
      return true;
    },
    {
      message: "Start year must be earlier than or equal to graduation year",
      path: ["startYear"],
    }
  );

export const updateTeacherQualificationSchema = z
  .object({
    level: qualificationLevelEnum.optional(),
    fieldOfStudy: z
      .string()
      .trim()
      .min(2, "Field of study must be at least 2 characters")
      .max(150, "Field of study must not exceed 150 characters")
      .optional(),
    institution: z
      .string()
      .trim()
      .max(200, "Institution name must not exceed 200 characters")
      .nullable()
      .optional(),
    startYear: yearFieldSchema,
    graduationYear: yearFieldSchema,
    documentUrl: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.startYear && data.graduationYear) {
        return data.startYear <= data.graduationYear;
      }
      return true;
    },
    {
      message: "Start year must be earlier than or equal to graduation year",
      path: ["startYear"],
    }
  );

export type CreateTeacherQualificationDto = z.infer<
  typeof createTeacherQualificationSchema
>;
export type UpdateTeacherQualificationDto = z.infer<
  typeof updateTeacherQualificationSchema
>;
