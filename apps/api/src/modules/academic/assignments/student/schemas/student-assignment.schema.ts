import { z } from "zod";

export const singleTransferSchema = z.object({
  targetSectionId: z.string().uuid("Invalid target section ID"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const bulkTransferSchema = z.object({
  studentIds: z
    .array(z.string().uuid("Invalid student ID"))
    .min(1, "Please select at least one student"),
  targetSectionId: z.string().uuid("Invalid target section ID"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const promotionPreviewQuerySchema = z.object({
  sourceAcademicYearId: z.string().uuid("Invalid source academic year ID"),
  targetAcademicYearId: z.string().uuid("Invalid target academic year ID"),
  gradeLevel: z.coerce.number().int().min(7).max(12),
});

export const commitPromotionSchema = z.object({
  sourceAcademicYearId: z.string().uuid("Invalid source academic year ID"),
  targetAcademicYearId: z.string().uuid("Invalid target academic year ID"),
  items: z
    .array(
      z.object({
        studentId: z.string().uuid("Invalid student ID"),
        targetGradeId: z.string().uuid("Invalid target grade ID"),
        targetSectionId: z.string().uuid("Invalid target section ID"),
        isPromoted: z.boolean(),
      })
    )
    .min(1, "Please provide at least one student promotion record"),
});

export const withdrawStudentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const rosterFilterSchema = z.object({
  academicYearId: z.string().uuid("Invalid academic year ID"),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
