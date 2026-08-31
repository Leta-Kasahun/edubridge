import { z } from "zod";

export const createSectionSchema = z.object({
  academicYearId: z.string().uuid("Invalid academic year ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  name: z.string().trim().min(1, "Section name is required").max(50, "Section name too long"),
  code: z.string().trim().max(50).optional(),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(200, "Capacity cannot exceed 200")
    .optional()
    .nullable(),
  homeroomTeacherId: z.string().uuid("Invalid teacher ID").optional().nullable(),
});

export const bulkCreateSectionsSchema = z.object({
  academicYearId: z.string().uuid("Invalid academic year ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  sectionNames: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Section name cannot be empty")
        .max(20, "Section name cannot exceed 20 characters")
    )
    .min(1, "At least one section name is required")
    .max(20, "Maximum 20 sections can be created at once"),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(200, "Capacity cannot exceed 200")
    .optional()
    .nullable(),
});

export const updateSectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required").max(50).optional(),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(200, "Capacity cannot exceed 200")
    .optional()
    .nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  homeroomTeacherId: z.string().uuid("Invalid teacher ID").optional().nullable(),
});

export const updateSectionStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});

export type CreateSectionDto = z.infer<typeof createSectionSchema>;
export type BulkCreateSectionsDto = z.infer<typeof bulkCreateSectionsSchema>;
export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;
export type UpdateSectionStatusDto = z.infer<typeof updateSectionStatusSchema>;
