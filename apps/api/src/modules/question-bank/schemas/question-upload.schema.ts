import { z } from "zod";
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
} from "../../../shared/constants/question-bank.constants.js";
import { QuestionOptionSchema } from "./question.schema.js";

export const ConfirmUploadQuestionItemSchema = z.preprocess(
  (val) => {
    if (typeof val === "object" && val !== null) {
      const v = val as Record<string, unknown>;
      const questionText = v.questionText ?? v.prompt ?? "";
      const points = v.points ?? v.defaultPoints ?? 1;
      const topicId =
        typeof v.topicId === "string" && v.topicId.trim() !== ""
          ? v.topicId.trim()
          : undefined;
      const objectiveId =
        typeof v.objectiveId === "string" && v.objectiveId.trim() !== ""
          ? v.objectiveId.trim()
          : undefined;
      return {
        ...v,
        questionText,
        points,
        topicId,
        objectiveId,
      };
    }
    return val;
  },
  z.object({
    questionText: z.string().trim().min(3, "Question text must be at least 3 characters"),
    type: z.enum(QUESTION_TYPES).default("MCQ"),
    difficulty: z.enum(DIFFICULTY_LEVELS).default("MEDIUM"),
    points: z.coerce.number().positive().default(1),
    explanation: z.string().trim().optional().nullable(),
    options: z.array(QuestionOptionSchema).optional().default([]),
    topicId: z.string().uuid("Invalid topic ID").optional().nullable(),
    objectiveId: z.string().uuid("Invalid objective ID").optional().nullable(),
  })
);

export const ConfirmUploadSchema = z.object({
  questions: z
    .array(ConfirmUploadQuestionItemSchema)
    .min(1, "At least one question must be selected for import"),
});

