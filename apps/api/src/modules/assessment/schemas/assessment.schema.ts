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

export const CreateAssessmentSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(ASSESSMENT_TYPES),
  gradingMode: z.enum(GRADING_MODES).default("AUTOMATIC"),
  timeLimitMinutes: z.number().int().min(1).max(300).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(100).nullable().optional(),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  availableFrom: z.string().datetime().nullable().optional(),
  availableUntil: z.string().datetime().nullable().optional(),
  examContextId: z.string().uuid().nullable().optional(),
  questions: z.array(AssessmentQuestionItemSchema).optional(),
});

export const UpdateAssessmentSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  type: z.enum(ASSESSMENT_TYPES).optional(),
  status: z.enum(ASSESSMENT_STATUSES).optional(),
  gradingMode: z.enum(GRADING_MODES).optional(),
  timeLimitMinutes: z.number().int().min(1).max(300).nullable().optional(),
  maxAttempts: z.number().int().min(1).max(100).nullable().optional(),
  randomizeQuestions: z.boolean().optional(),
  randomizeOptions: z.boolean().optional(),
  showResults: z.boolean().optional(),
  availableFrom: z.string().datetime().nullable().optional(),
  availableUntil: z.string().datetime().nullable().optional(),
  examContextId: z.string().uuid().nullable().optional(),
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
  dueAt: z.string().datetime().nullable().optional(),
});

export const UpdateAssignmentSchema = z.object({
  status: z.enum(ASSESSMENT_ASSIGNMENT_STATUSES).optional(),
  dueAt: z.string().datetime().nullable().optional(),
});

export type CreateAssessmentInput = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof UpdateAssessmentSchema>;
export type AssessmentQueryInput = z.infer<typeof AssessmentQuerySchema>;
export type AddAssessmentQuestionsInput = z.infer<typeof AddAssessmentQuestionsSchema>;
export type AssignAssessmentInput = z.infer<typeof AssignAssessmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentSchema>;
