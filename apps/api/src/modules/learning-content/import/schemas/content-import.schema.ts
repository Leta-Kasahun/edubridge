import { z } from "zod";
import { CONTENT_TYPES } from "../../../../shared/constants/index.js";

export const RawContentImportRowSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
  type: z.enum(CONTENT_TYPES, {
    message: `Type must be one of: ${CONTENT_TYPES.join(", ")}`,
  }),
  description: z.string().trim().max(2000).optional().nullable(),
  topicCode: z.string().trim().min(1, "Topic code is required"),
  objectiveCode: z.string().trim().optional().nullable(),
  initialText: z.string().trim().max(50000).optional().nullable(),
  resourceUrl: z.string().trim().url("Invalid resource URL").optional().nullable(),
});

export const ContentImportPreviewRequestSchema = z.object({
  csvContent: z.string().min(10, "CSV content cannot be empty"),
  curriculumVersionId: z.string().uuid("Invalid curriculum version ID").optional(),
});

export const ValidatedContentImportRowSchema = z.object({
  rowNumber: z.number().int().min(1),
  title: z.string().trim().min(3),
  type: z.enum(CONTENT_TYPES),
  description: z.string().optional().nullable(),
  topicCode: z.string().trim().min(1),
  topicId: z.string().uuid().optional(),
  objectiveCode: z.string().optional().nullable(),
  objectiveId: z.string().uuid().optional(),
  initialText: z.string().optional().nullable(),
  resourceUrl: z.string().optional().nullable(),
  isValid: z.boolean(),
  errors: z.array(z.string()),
});

export const ContentImportCommitRequestSchema = z.object({
  rows: z
    .array(ValidatedContentImportRowSchema)
    .min(1, "At least one row required for commit"),
  curriculumVersionId: z.string().uuid().optional(),
});

export type ContentImportPreviewRequestInput = z.infer<
  typeof ContentImportPreviewRequestSchema
>;
export type ContentImportCommitRequestInput = z.infer<
  typeof ContentImportCommitRequestSchema
>;
