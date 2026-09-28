import { z } from "zod";

export const sectionMasteryQuerySchema = z.object({
  subjectId: z
    .string()
    .uuid("Invalid subject ID")
    .optional()
    .or(z.literal("")),
  academicYearId: z
    .string()
    .uuid("Invalid academic year ID")
    .optional()
    .or(z.literal("")),
});

export type SectionMasteryQueryDto = z.infer<typeof sectionMasteryQuerySchema>;

export const studentMasteryQuerySchema = z.object({
  subjectId: z
    .string()
    .uuid("Invalid subject ID")
    .optional()
    .or(z.literal("")),
});

export type StudentMasteryQueryDto = z.infer<typeof studentMasteryQuerySchema>;

export const recalculateMasterySchema = z.object({
  sectionId: z.string().uuid("Invalid section ID").optional(),
  studentId: z.string().uuid("Invalid student ID").optional(),
  topicId: z.string().uuid("Invalid topic ID").optional(),
});

export type RecalculateMasteryDto = z.infer<typeof recalculateMasterySchema>;
