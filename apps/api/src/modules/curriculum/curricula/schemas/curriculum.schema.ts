import { z } from "zod";
import {
  CURRICULUM_STATUSES,
  CURRICULUM_VERSION_STATUSES,
  CURRICULUM_SCOPES,
  CURRICULUM_CODE_REGEX,
  DEFAULT_CURRICULUM_PAGE_LIMIT,
  MAX_CURRICULUM_PAGE_LIMIT,
} from "../../../../shared/constants/curriculum.constants.js";

export const createCurriculumSchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code cannot exceed 50 characters")
    .regex(
      CURRICULUM_CODE_REGEX,
      "Code may only contain letters, numbers, hyphens and underscores"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name cannot exceed 200 characters"),
  description: z.string().max(1000).optional().nullable(),
  scope: z.enum(CURRICULUM_SCOPES).default("TENANT"),
  authorityName: z.string().max(150).optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
  initialVersionCode: z
    .string()
    .min(1)
    .max(50)
    .regex(CURRICULUM_CODE_REGEX)
    .optional()
    .default("v1"),
  initialVersionName: z.string().min(1).max(100).optional().default("Version 1"),
});

export const updateCurriculumSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name cannot exceed 200 characters")
    .optional(),
  description: z.string().max(1000).optional().nullable(),
  authorityName: z.string().max(150).optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const createCurriculumVersionSchema = z.object({
  code: z
    .string()
    .min(1, "Version code is required")
    .max(50, "Version code cannot exceed 50 characters")
    .regex(
      CURRICULUM_CODE_REGEX,
      "Version code may only contain letters, numbers, hyphens and underscores"
    ),
  name: z
    .string()
    .min(1, "Version name is required")
    .max(100, "Version name cannot exceed 100 characters"),
  description: z.string().max(1000).optional().nullable(),
  effectiveFrom: z.coerce.date().optional().nullable(),
  effectiveTo: z.coerce.date().optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const updateCurriculumVersionSchema = z.object({
  name: z
    .string()
    .min(1, "Version name is required")
    .max(100, "Version name cannot exceed 100 characters")
    .optional(),
  description: z.string().max(1000).optional().nullable(),
  effectiveFrom: z.coerce.date().optional().nullable(),
  effectiveTo: z.coerce.date().optional().nullable(),
  externalId: z.string().max(100).optional().nullable(),
});

export const changeCurriculumStatusSchema = z.object({
  status: z.enum(CURRICULUM_STATUSES),
});

export const changeCurriculumVersionStatusSchema = z.object({
  status: z.enum(CURRICULUM_VERSION_STATUSES),
});

export const curriculumFilterSchema = z.object({
  search: z.string().optional(),
  scope: z.enum(CURRICULUM_SCOPES).optional(),
  status: z.enum(CURRICULUM_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_CURRICULUM_PAGE_LIMIT)
    .default(DEFAULT_CURRICULUM_PAGE_LIMIT),
});
