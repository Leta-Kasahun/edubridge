import { z } from "zod";

export const rawCurriculumImportRowSchema = z.object({
  gradeLevel: z.union([z.number(), z.string()]),
  subjectName: z.string().min(1, "Subject name is required"),
  unitTitle: z.string().min(1, "Unit title is required"),
  unitCode: z.string().optional().nullable(),
  unitDescription: z.string().optional().nullable(),
  topicTitle: z.string().min(1, "Topic title is required"),
  topicCode: z.string().optional().nullable(),
  topicDescription: z.string().optional().nullable(),
  objectiveStatement: z.string().min(1, "Objective statement is required"),
  objectiveCode: z.string().optional().nullable(),
  objectiveDescription: z.string().optional().nullable(),
  externalId: z.string().optional().nullable(),
});

export const curriculumImportPreviewSchema = z
  .object({
    curriculumVersionId: z.string().uuid("Invalid curriculum version ID"),
    csvContent: z.string().optional(),
    rows: z.array(rawCurriculumImportRowSchema).optional(),
  })
  .refine(
    (data) => Boolean(data.csvContent?.trim() || (data.rows && data.rows.length > 0)),
    {
      message: "Either csvContent or rows array must be provided",
      path: ["csvContent"],
    }
  );

export const curriculumImportCommitSchema = z
  .object({
    curriculumVersionId: z.string().uuid("Invalid curriculum version ID"),
    csvContent: z.string().optional(),
    rows: z.array(rawCurriculumImportRowSchema).optional(),
  })
  .refine(
    (data) => Boolean(data.csvContent?.trim() || (data.rows && data.rows.length > 0)),
    {
      message: "Either csvContent or rows array must be provided",
      path: ["csvContent"],
    }
  );
