import { z } from "zod";
import { CURRICULUM_CODE_REGEX } from "../../../../shared/constants/curriculum.constants.js";

export const createCurriculumSubjectSchema = z.object({
  curriculumVersionId: z.string().uuid("Invalid curriculum version ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  subjectId: z.string().uuid("Invalid subject ID"),
  externalId: z.string().max(100).optional().nullable(),
});

export const createUnitSchema = z.object({
  curriculumSubjectId: z.string().uuid("Invalid curriculum subject ID"),
  code: z
    .string()
    .min(1, "Unit code is required")
    .max(50, "Unit code cannot exceed 50 characters")
    .regex(
      CURRICULUM_CODE_REGEX,
      "Unit code may only contain letters, numbers, hyphens and underscores"
    ),
  title: z
    .string()
    .min(1, "Unit title is required")
    .max(255, "Unit title cannot exceed 255 characters"),
  description: z.string().max(2000).optional().nullable(),
  orderIndex: z.coerce.number().int().positive().optional(),
  externalId: z.string().max(100).optional().nullable(),
});

export const updateUnitSchema = z.object({
  title: z
    .string()
    .min(1, "Unit title is required")
    .max(255, "Unit title cannot exceed 255 characters")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const createTopicSchema = z.object({
  unitId: z.string().uuid("Invalid unit ID"),
  code: z
    .string()
    .min(1, "Topic code is required")
    .max(50, "Topic code cannot exceed 50 characters")
    .regex(
      CURRICULUM_CODE_REGEX,
      "Topic code may only contain letters, numbers, hyphens and underscores"
    ),
  title: z
    .string()
    .min(1, "Topic title is required")
    .max(255, "Topic title cannot exceed 255 characters"),
  description: z.string().max(2000).optional().nullable(),
  orderIndex: z.coerce.number().int().positive().optional(),
  externalId: z.string().max(100).optional().nullable(),
});

export const updateTopicSchema = z.object({
  title: z
    .string()
    .min(1, "Topic title is required")
    .max(255, "Topic title cannot exceed 255 characters")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const createObjectiveSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
  code: z
    .string()
    .min(1, "Objective code is required")
    .max(50, "Objective code cannot exceed 50 characters")
    .regex(
      CURRICULUM_CODE_REGEX,
      "Objective code may only contain letters, numbers, hyphens and underscores"
    ),
  statement: z
    .string()
    .min(3, "Objective statement must be at least 3 characters")
    .max(1000, "Objective statement cannot exceed 1000 characters"),
  description: z.string().max(2000).optional().nullable(),
  orderIndex: z.coerce.number().int().positive().optional(),
  externalId: z.string().max(100).optional().nullable(),
});

export const updateObjectiveSchema = z.object({
  statement: z
    .string()
    .min(3, "Objective statement must be at least 3 characters")
    .max(1000, "Objective statement cannot exceed 1000 characters")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const reorderStructureItemsSchema = z.object({
  entityType: z.enum(["unit", "topic", "objective"]),
  parentId: z.string().uuid("Invalid parent ID"),
  orderedIds: z
    .array(z.string().uuid("Invalid item ID"))
    .min(1, "At least one ID is required"),
});
