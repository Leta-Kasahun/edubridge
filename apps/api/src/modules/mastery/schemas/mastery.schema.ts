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

export const recordPracticeEvidenceSchema = z.object({
  bankId: z.string().min(1, "Bank ID is required"),
  results: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required"),
      questionVersionId: z.string().optional(),
      isCorrect: z.boolean(),
      awardedPoints: z.number().default(0),
      maxPoints: z.number().default(1),
      selectedOptionKey: z.string().optional(),
    })
  ),
});

export type RecordPracticeEvidenceSchemaDto = z.infer<typeof recordPracticeEvidenceSchema>;
