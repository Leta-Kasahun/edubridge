import { z } from "zod";

export const studentGenderSchema = z.enum(["MALE", "FEMALE"]);

export const singleStudentFormSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  gradeId: z.string().min(1, "Grade level is required"),
  sectionId: z.string().optional(),
  sectionName: z.string().trim().max(50).optional(),
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
    .max(50, "Last name must not exceed 50 characters")
    .optional(),
  gender: studentGenderSchema,
  studentCode: z
    .string()
    .trim()
    .max(30, "Student code must not exceed 30 characters")
    .optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")),
  nationality: z.string().trim().max(50).optional(),
}).refine((data) => Boolean(data.sectionId || (data.sectionName && data.sectionName.trim().length > 0)), {
  message: "Please select an existing section or enter a new section name",
  path: ["sectionId"],
});

export type SingleStudentFormData = z.infer<typeof singleStudentFormSchema>;

export const studentCsvRowSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  middleName: z.string().trim().min(1, "Middle name is required").max(50),
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
  section: z.string().trim().min(1, "Section is required").max(50),
  studentCode: z.string().trim().max(30).optional(),
  email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional(),
});

export type StudentCsvRowData = z.infer<typeof studentCsvRowSchema>;
