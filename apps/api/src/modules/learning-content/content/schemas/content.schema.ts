import { z } from "zod";
import {
  CONTENT_TYPES,
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

export const CreateLearningContentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(CONTENT_TYPES, {
    message: `Type must be one of: ${CONTENT_TYPES.join(", ")}`,
  }),
  source: z.enum(CONTENT_SOURCE_TYPES).optional().default("TEACHER"),
  primaryTopicId: z.string().uuid("Invalid primary topic ID"),
  secondaryTopicIds: z.array(z.string().uuid("Invalid topic ID")).optional().default([]),
  objectiveIds: z.array(z.string().uuid("Invalid objective ID")).optional().default([]),
  initialVersionBody: ContentVersionBodySchema.optional(),
  changeNote: z.string().trim().max(500).optional(),
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
    source: z.enum(CONTENT_SOURCE_TYPES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const UpdateContentMappingsSchema = z.object({
  primaryTopicId: z.string().uuid("Invalid primary topic ID"),
  secondaryTopicIds: z.array(z.string().uuid("Invalid topic ID")).optional().default([]),
  objectiveIds: z.array(z.string().uuid("Invalid objective ID")).optional().default([]),
});

export const CreateContentVersionSchema = z.object({
  body: ContentVersionBodySchema,
  changeNote: z.string().trim().max(500).optional(),
});

export const ContentFilterQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(CONTENT_TYPES).optional(),
  status: z.enum(CONTENT_STATUSES).optional(),
  source: z.enum(CONTENT_SOURCE_TYPES).optional(),
  topicId: z.string().uuid("Invalid topic ID").optional(),
  objectiveId: z.string().uuid("Invalid objective ID").optional(),
  authorId: z.string().uuid("Invalid author ID").optional(),
  curriculumVersionId: z.string().uuid("Invalid curriculum version ID").optional(),
  subjectId: z.string().uuid("Invalid subject ID").optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_CONTENT_PAGE_LIMIT)
    .default(DEFAULT_CONTENT_PAGE_LIMIT),
});

export type CreateLearningContentInput = z.infer<typeof CreateLearningContentSchema>;
export type UpdateLearningContentInput = z.infer<typeof UpdateLearningContentSchema>;
export type UpdateContentMappingsInput = z.infer<typeof UpdateContentMappingsSchema>;
export type CreateContentVersionInput = z.infer<typeof CreateContentVersionSchema>;
export type ContentFilterQueryInput = z.infer<typeof ContentFilterQuerySchema>;
