import { z } from "zod";

export const createTeacherAssignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID"),
  academicYearId: z.string().uuid("Invalid academic year ID"),
  sectionId: z.string().uuid("Invalid section ID"),
  subjectId: z.string().uuid("Invalid subject ID").optional().nullable(),
  role: z.enum(["HOMEROOM_TEACHER", "SUBJECT_TEACHER", "OTHER"]),
});

export const reassignTeacherAssignmentSchema = z.object({
  replacementTeacherId: z.string().uuid("Invalid replacement teacher ID"),
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const endTeacherAssignmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason cannot exceed 500 characters"),
});

export const teacherAssignmentFilterSchema = z.object({
  academicYearId: z.string().uuid("Invalid academic year ID"),
  gradeId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  role: z.enum(["HOMEROOM_TEACHER", "SUBJECT_TEACHER", "OTHER"]).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
