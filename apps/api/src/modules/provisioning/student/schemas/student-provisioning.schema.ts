import { z } from "zod";

export const studentGenderSchema = z.enum(["MALE", "FEMALE"]);

export const studentStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "GRADUATED",
  "TRANSFERRED",
  "WITHDRAWN",
  "SUSPENDED",
]);

export const studentAccountStatusSchema = z.enum([
  "PENDING_FIRST_LOGIN",
  "ACTIVE",
  "SUSPENDED",
  "LOCKED",
  "DEACTIVATED",
]);

export const createGradeSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  level: z.coerce
    .number()
    .int("Grade level must be an integer")
    .min(1, "Grade level must be between 1 and 20")
    .max(20, "Grade level must be between 1 and 20"),
});

export const createSectionSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  academicYearId: z.string().uuid("Academic year is required"),
  gradeId: z.string().uuid("Grade is required"),
  name: z.string().trim().min(1, "Section name is required").max(50),
  capacity: z.coerce.number().int().min(1).optional(),
});

export const provisionStudentSchema = z
  .object({
    tenantId: z.string().uuid("Invalid tenant ID").optional(),
    academicYearId: z.string().uuid("Academic year is required"),
    gradeId: z.string().uuid("Grade is required"),
    sectionId: z.string().uuid("Invalid section ID").optional(),
    sectionName: z.string().min(1, "Section name is required").max(50).optional(),
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name must not exceed 50 characters"),
    middleName: z
      .string()
      .trim()
      .min(1, "Father name is required")
      .max(50, "Father name must not exceed 50 characters"),
    lastName: z.string().trim().max(50, "Grandfather name must not exceed 50 characters").optional(),
    gender: studentGenderSchema,
    studentCode: z.string().trim().max(30, "Student code must not exceed 30 characters").optional(),
    dateOfBirth: z.string().optional(),
    email: z.string().trim().email("Invalid email address format").optional().or(z.literal("")),
    nationality: z.string().trim().max(50).optional(),
  })
  .refine((data) => Boolean(data.sectionId || data.sectionName), {
    message: "Please select or provide a section for the student",
    path: ["sectionId"],
  });

export const studentRowValidationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  middleName: z.string().trim().min(1, "Father name is required").max(50),
  lastName: z.string().trim().max(50).optional(),
  gender: z
    .string()
    .trim()
    .toUpperCase()
    .transform((val) => {
      if (val === "M" || val === "MALE") return "MALE";
      if (val === "F" || val === "FEMALE") return "FEMALE";
      return val;
    })
    .pipe(studentGenderSchema),
  section: z.string().trim().max(50).optional(),
  studentCode: z.string().trim().max(30).optional(),
  email: z.string().trim().email("Invalid email address format").optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional(),
});

export const bulkStudentCsvSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID").optional(),
  academicYearId: z.string().uuid("Academic year is required"),
  gradeId: z.string().uuid("Grade is required"),
  sectionId: z.string().uuid("Invalid section ID").optional(),
  sectionName: z.string().trim().min(1).max(50).optional(),
  csvContent: z.string().min(10, "CSV file is empty or missing data rows"),
  fileName: z.string().trim().max(255).optional(),
});

export const studentQueryFiltersSchema = z.object({
  academicYearId: z.string().uuid("Invalid academic year ID").optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
  sectionId: z.string().uuid("Invalid section ID").optional(),
  search: z.string().trim().optional(),
  status: studentStatusSchema.optional(),
  accountStatus: studentAccountStatusSchema.optional(),
  gender: studentGenderSchema.optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});
