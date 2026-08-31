import { z } from "zod";

export const createSubjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code cannot exceed 20 characters")
    .toUpperCase(),
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name cannot exceed 100 characters"),
  description: z.string().trim().max(500).optional().nullable(),
  gradeLevels: z.array(z.number().int().min(7).max(12)).optional(),
});

export const updateSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name cannot exceed 100 characters")
    .optional(),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const assignGradeSubjectsSchema = z.object({
  gradeLevels: z
    .array(z.number().int().min(7).max(12))
    .min(0, "Must provide grade levels array"),
});

export const subjectFilterSchema = z.object({
  gradeLevel: z.coerce.number().int().min(7).max(12).optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .optional(),
  search: z.string().trim().optional(),
});
