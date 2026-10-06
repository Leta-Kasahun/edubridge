import { z } from "zod";
import { ATTEMPT_STATUSES } from "../../../shared/constants/assessment.constants.js";

export const StartAttemptSchema = z.object({
  assignmentId: z.string().uuid("Invalid assignmentId format").nullish().or(z.literal("")),
});

export const SaveAnswerSchema = z.object({
  questionVersionId: z.string().uuid("Invalid questionVersionId format"),
  response: z.unknown(),
});

export const BatchSaveAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionVersionId: z.string().uuid("Invalid questionVersionId format"),
        response: z.unknown(),
      })
    )
    .min(1, "At least one answer must be provided"),
});

export const SubmitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionVersionId: z.string().uuid("Invalid questionVersionId format"),
        response: z.unknown(),
      })
    )
    .optional(),
});

export const AttemptQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  studentId: z.string().uuid().optional(),
  assignmentId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  status: z.enum(ATTEMPT_STATUSES).optional(),
  sortBy: z.enum(["startedAt", "submittedAt", "score"]).default("startedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type StartAttemptInput = z.infer<typeof StartAttemptSchema>;
export type SaveAnswerInput = z.infer<typeof SaveAnswerSchema>;
export type BatchSaveAnswersInput = z.infer<typeof BatchSaveAnswersSchema>;
export type SubmitAttemptInput = z.infer<typeof SubmitAttemptSchema>;
export type AttemptQueryInput = z.infer<typeof AttemptQuerySchema>;
