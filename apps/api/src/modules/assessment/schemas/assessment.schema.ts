import { z } from "zod";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_STATUSES,
  GRADING_MODES,
  ASSESSMENT_ASSIGNMENT_STATUSES,
} from "../../../shared/constants/assessment.constants.js";

export const AssessmentQuestionItemSchema = z.object({
  questionVersionId: z.string().uuid("Invalid questionVersionId format"),
  orderIndex: z.number().int().min(0),
  points: z.number().positive("Points must be greater than 0"),
});

const coerceIsoDate = z.preprocess((val) => {
  if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
    return null;
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val.toISOString();
  }
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}, z.string().datetime().nullable().optional());

const coerceUuidOrNull = z.preprocess((val) => {
  if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
    return null;
  }
  if (typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim())) {
    return val.trim();
  }
  return null;
}, z.string().uuid().nullable().optional());

const coerceNullablePositiveInt = z.preprocess((val) => {
  if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
    return null;
  }
  const num = Number(val);
  return isNaN(num) || num <= 0 ? null : num;
}, z.number().int().positive().nullable().optional());

const coerceNullableString = z.preprocess((val) => {
  if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
    return null;
  }
  return typeof val === "string" ? val.trim() || null : null;
}, z.string().max(2000).nullable().optional());

export const CreateAssessmentSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: coerceNullableString,
  type: z.enum(ASSESSMENT_TYPES),
  gradingMode: z.enum(GRADING_MODES).default("AUTOMATIC"),
  timeLimitMinutes: coerceNullablePositiveInt,
  maxAttempts: coerceNullablePositiveInt,
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  availableFrom: coerceIsoDate,
  availableUntil: coerceIsoDate,
  examContextId: coerceUuidOrNull,
  questions: z.array(AssessmentQuestionItemSchema).optional(),
});

export const UpdateAssessmentSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200).optional(),
  description: coerceNullableString,
  type: z.enum(ASSESSMENT_TYPES).optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
  gradingMode: z.enum(GRADING_MODES).optional(),
  timeLimitMinutes: coerceNullablePositiveInt,
  maxAttempts: coerceNullablePositiveInt,
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  showResults: z.boolean().optional(),
  availableFrom: coerceIsoDate,
  availableUntil: coerceIsoDate,
  examContextId: coerceUuidOrNull,
});

export const AssessmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  type: z.enum(ASSESSMENT_TYPES).optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
  gradingMode: z.enum(GRADING_MODES).optional(),
  examContextId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  createdById: z.string().uuid().optional(),
  sortBy: z.enum(["createdAt", "title", "availableFrom", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const AddAssessmentQuestionsSchema = z.object({
  questions: z
    .array(AssessmentQuestionItemSchema)
    .min(1, "At least one question must be provided"),
});

export const AssignAssessmentSchema = z.object({
  sectionIds: z
    .array(z.string().uuid("Invalid sectionId format"))
    .min(1, "At least one section must be selected"),
  dueAt: coerceIsoDate,
});

export const UpdateAssignmentSchema = z.object({
  status: z.enum(ASSESSMENT_ASSIGNMENT_STATUSES).optional(),
  dueAt: coerceIsoDate,
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;
export type AssessmentQueryInput = z.infer<typeof AssessmentQuerySchema>;
export type AddAssessmentQuestionsInput = z.infer<typeof AddAssessmentQuestionsSchema>;
export type AssignAssessmentInput = z.infer<typeof AssignAssessmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;
