import { z } from "zod";
import {
  CONTENT_TYPES,
  CONTENT_SCOPES,
  CONTENT_STATUSES,
  CONTENT_SOURCE_TYPES,
  DEFAULT_CONTENT_PAGE_LIMIT,
  MAX_CONTENT_PAGE_LIMIT,
} from "../../../../shared/constants/index.js";

export const ContentVersionBodySchema = z
  .object({
    text: z.string().optional(),
    summary: z.string().optional(),
    instructions: z.string().optional(),
    resources: z.array(z.string()).optional(),
    attachmentIds: z.array(z.string().uuid("Invalid attachment ID")).optional(),
  })
  .passthrough();

export const CreateLearningContentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters"),
    description: z.string().trim().max(2000).optional().nullable(),
    type: z.enum(CONTENT_TYPES, {
      message: `Type must be one of: ${CONTENT_TYPES.join(", ")}`,
    }),
    scope: z.enum(CONTENT_SCOPES).optional().default("TOPIC"),
    source: z.enum(CONTENT_SOURCE_TYPES).optional().default("TEACHER"),
    subjectId: z.string().uuid("Invalid subject ID").optional(),
    gradeId: z.string().uuid("Invalid grade ID").optional(),
    unitId: z.string().uuid("Invalid unit ID").optional(),
    curriculumVersionId: z.string().uuid("Invalid curriculum version ID").optional(),
    targetGradeLevels: z
      .array(z.number().int().min(1).max(12))
      .optional()
      .default([]),
    primaryTopicId: z.string().uuid("Invalid primary topic ID").optional(),
    secondaryTopicIds: z
      .array(z.string().uuid("Invalid topic ID"))
      .optional()
      .default([]),
    objectiveIds: z
      .array(z.string().uuid("Invalid objective ID"))
      .optional()
      .default([]),
    initialVersionBody: ContentVersionBodySchema.optional(),
    changeNote: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const scope = data.scope ?? "TOPIC";

    if (scope === "SUBJECT" && !data.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: "Subject is required when scope is SUBJECT",
      });
    }

    if (scope === "GRADE_SUBJECT") {
      if (!data.subjectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subjectId"],
          message: "Subject is required when scope is GRADE_SUBJECT",
        });
      }
      if (
        !data.gradeId &&
        (!data.targetGradeLevels || data.targetGradeLevels.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gradeId"],
          message:
            "Grade or target grade levels are required when scope is GRADE_SUBJECT",
        });
      }
    }

    if (scope === "UNIT" && !data.unitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitId"],
        message: "Unit is required when scope is UNIT",
      });
    }

    if (scope === "TOPIC" && !data.primaryTopicId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["primaryTopicId"],
        message: "Primary topic is required when scope is TOPIC",
      });
    }
  });

export const UpdateLearningContentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must not exceed 255 characters")
      .optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    type: z.enum(CONTENT_TYPES).optional(),
    scope: z.enum(CONTENT_SCOPES).optional(),
    source: z.enum(CONTENT_SOURCE_TYPES).optional(),
    subjectId: z.string().uuid("Invalid subject ID").optional().nullable(),
    gradeId: z.string().uuid("Invalid grade ID").optional().nullable(),
    unitId: z.string().uuid("Invalid unit ID").optional().nullable(),
    curriculumVersionId: z
      .string()
      .uuid("Invalid curriculum version ID")
      .optional()
      .nullable(),
    targetGradeLevels: z
      .array(z.number().int().min(1).max(12))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const UpdateContentMappingsSchema = z.object({
  scope: z.enum(CONTENT_SCOPES).optional(),
  subjectId: z.string().uuid("Invalid subject ID").optional().nullable(),
  gradeId: z.string().uuid("Invalid grade ID").optional().nullable(),
  unitId: z.string().uuid("Invalid unit ID").optional().nullable(),
  curriculumVersionId: z
    .string()
    .uuid("Invalid curriculum version ID")
    .optional()
    .nullable(),
  targetGradeLevels: z
    .array(z.number().int().min(1).max(12))
    .optional(),
  primaryTopicId: z.string().uuid("Invalid primary topic ID").optional().nullable(),
  secondaryTopicIds: z
    .array(z.string().uuid("Invalid topic ID"))
    .optional()
    .default([]),
  objectiveIds: z
    .array(z.string().uuid("Invalid objective ID"))
    .optional()
    .default([]),
});

export const CreateContentVersionSchema = z.object({
  body: ContentVersionBodySchema,
  changeNote: z.string().trim().max(500).optional(),
});

export const ContentFilterQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(CONTENT_TYPES).optional(),
  scope: z.enum(CONTENT_SCOPES).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  source: z.enum(CONTENT_SOURCE_TYPES).optional(),
  subjectId: z.string().uuid("Invalid subject ID").optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
  targetGradeLevel: z.coerce.number().int().min(1).max(12).optional(),
  unitId: z.string().uuid("Invalid unit ID").optional(),
  topicId: z.string().uuid("Invalid topic ID").optional(),
  objectiveId: z.string().uuid("Invalid objective ID").optional(),
  authorId: z.string().uuid("Invalid author ID").optional(),
  curriculumVersionId: z
    .string()
    .uuid("Invalid curriculum version ID")
    .optional(),
  academicYearId: z
    .string()
    .uuid("Invalid academic year ID")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_CONTENT_PAGE_LIMIT)
    .default(DEFAULT_CONTENT_PAGE_LIMIT),
});

export const SaveContentProgressSchema = z.object({
  lastPositionSeconds: z.number().min(0).default(0),
  durationSeconds: z.number().min(0).default(0),
  progressPercent: z.number().min(0).max(100).default(0),
  isCompleted: z.boolean().optional(),
});

export type CreateLearningContentInput = z.infer<typeof CreateLearningContentSchema>;
export type UpdateLearningContentInput = z.infer<typeof UpdateLearningContentSchema>;
export type UpdateContentMappingsInput = z.infer<typeof UpdateContentMappingsSchema>;
export type CreateContentVersionInput = z.infer<typeof CreateContentVersionSchema>;
export type ContentFilterQueryInput = z.infer<typeof ContentFilterQuerySchema>;
export type SaveContentProgressInput = z.infer<typeof SaveContentProgressSchema>;
