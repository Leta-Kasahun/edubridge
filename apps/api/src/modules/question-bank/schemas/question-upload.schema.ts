import { z } from "zod";
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
} from "../../../shared/constants/question-bank.constants.js";
import { QuestionOptionSchema } from "./question.schema.js";

export const ConfirmUploadQuestionItemSchema = z.object({
  questionText: z.string().trim().min(3, "Question text required"),
  type: z.enum(QUESTION_TYPES).default("MCQ"),
  difficulty: z.enum(DIFFICULTY_LEVELS).default("MEDIUM"),
  points: z.coerce.number().positive().default(1),
  explanation: z.string().trim().optional().nullable(),
  options: z.array(QuestionOptionSchema).optional().default([]),
  topicId: z.string().uuid("Invalid topic ID"),
  objectiveId: z.string().uuid("Invalid objective ID").optional().nullable(),
});

export const ConfirmUploadSchema = z.object({
  questions: z
    .array(ConfirmUploadQuestionItemSchema)
    .min(1, "At least one question must be selected for import"),
});
