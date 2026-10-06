import { z } from "zod";

export const ManualGradeAnswerItemSchema = z.object({
  questionVersionId: z.string().uuid("Invalid questionVersionId format"),
  awardedPoints: z.number().min(0, "Awarded points must be non-negative"),
  feedback: z.string().trim().max(1000, "Feedback must not exceed 1000 characters").nullish(),
});

export const ManualGradeAttemptSchema = z.object({
  grades: z.array(ManualGradeAnswerItemSchema).default([]),
  generalFeedback: z.string().trim().max(2000, "General feedback must not exceed 2000 characters").nullish(),
});

export const SubmitQuestionFeedbackSchema = z.object({
  questionVersionId: z.string().min(1, "questionVersionId is required"),
  category: z.string().trim().min(1).default("GENERAL"),
  message: z.string().trim().min(1, "Message must not be empty").max(1000, "Message must not exceed 1000 characters"),
});

export const StudentResultsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ManualGradeAnswerItemInput = z.infer<typeof ManualGradeAnswerItemSchema>;
export type ManualGradeAttemptInput = z.infer<typeof ManualGradeAttemptSchema>;
export type SubmitQuestionFeedbackInputSchema = z.infer<typeof SubmitQuestionFeedbackSchema>;
export type StudentResultsQueryInput = z.infer<typeof StudentResultsQuerySchema>;
