import { z } from "zod";
import {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  QUESTION_STATUSES,
  QUESTION_SOURCE_TYPES,
  QUESTION_BANK_PAGINATION,
} from "../../../shared/constants/question-bank.constants.js";

export const QuestionOptionSchema = z.preprocess((val) => {
  if (typeof val === "object" && val !== null) {
    const v = val as Record<string, unknown>;
    return {
      optionKey: v.optionKey ?? (typeof v.orderIndex === "number" ? String.fromCharCode(65 + v.orderIndex) : "A"),
      optionText: v.optionText ?? v.text ?? "",
      orderIndex: typeof v.orderIndex === "number" ? v.orderIndex : 0,
      isCorrect: Boolean(v.isCorrect),
    };
  }
  return val;
}, z.object({
  optionKey: z.string().trim().min(1).max(10).default("A"),
  optionText: z.string().trim().min(1, "Option text cannot be empty"),
  orderIndex: z.number().int().min(0).default(0),
  isCorrect: z.boolean().default(false),
}));

export const QuestionTopicSchema = z.object({
  topicId: z.string().uuid("Invalid topic ID"),
  isPrimary: z.boolean().optional().default(false),
});

export const QuestionObjectiveSchema = z.object({
  objectiveId: z.string().uuid("Invalid objective ID"),
});

export const CreateQuestionSchema = z
  .preprocess((val) => {
    if (typeof val === "object" && val !== null) {
      const v = val as Record<string, unknown>;
      const questionText = v.questionText ?? v.prompt ?? "";
      const points = v.points ?? v.defaultPoints ?? 1;

      let topicIds = v.topicIds;
      if (!topicIds && typeof v.topicId === "string" && v.topicId.trim() !== "") {
        topicIds = [{ topicId: v.topicId, isPrimary: true }];
      }

      let objectiveIds = v.objectiveIds;
      if (!objectiveIds && typeof v.objectiveId === "string" && v.objectiveId.trim() !== "") {
        objectiveIds = [{ objectiveId: v.objectiveId }];
      }

      let configuration = v.configuration as Record<string, unknown> | undefined;
      if (typeof v.imageUrl === "string" && v.imageUrl.trim() !== "") {
        configuration = { ...(configuration || {}), imageUrl: v.imageUrl.trim() };
      }

      return {
        ...v,
        questionText,
        points,
        configuration,
        topicIds: Array.isArray(topicIds) ? topicIds : undefined,
        objectiveIds: Array.isArray(objectiveIds) ? objectiveIds : undefined,
      };
    }
    return val;
  }, z.object({
    type: z.enum(QUESTION_TYPES),
    difficulty: z.enum(DIFFICULTY_LEVELS).optional().default("MEDIUM"),
    questionText: z
      .string()
      .trim()
      .min(3, "Question text must be at least 3 characters"),
    explanation: z.string().trim().max(3000).optional().nullable(),
    imageUrl: z.string().trim().max(2000).optional().nullable(),
    points: z.coerce.number().positive().default(1),
    source: z.enum(QUESTION_SOURCE_TYPES).optional().default("TEACHER"),
    options: z.array(QuestionOptionSchema).optional().default([]),
    configuration: z.record(z.string(), z.unknown()).optional().nullable(),
    topicIds: z.array(QuestionTopicSchema).optional().default([]),
    objectiveIds: z.array(QuestionObjectiveSchema).optional().default([]),
  }))
  .superRefine((data, ctx) => {
    if (data.type === "MCQ") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "MCQ questions must have at least 2 options",
        });
      } else {
        const correct = data.options.filter((o) => o.isCorrect);
        if (correct.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["options"],
            message: "MCQ must have at least one option marked as correct",
          });
        }
      }
    } else if (data.type === "TRUE_FALSE") {
      if (!data.options || data.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["options"],
          message: "True/False questions must have exactly 2 options",
        });
      }
    }
  });

export const BatchCreateQuestionsSchema = z.object({
  questions: z.array(CreateQuestionSchema).min(1, "At least one question is required"),
});

export const UpdateQuestionSchema = z.preprocess((val) => {
  if (typeof val === "object" && val !== null) {
    const v = val as Record<string, unknown>;
    const questionText = v.questionText ?? v.prompt;
    const points = v.points ?? v.defaultPoints;

    let topicIds = v.topicIds;
    if (!topicIds && typeof v.topicId === "string" && v.topicId.trim() !== "") {
      topicIds = [{ topicId: v.topicId, isPrimary: true }];
    }

    let objectiveIds = v.objectiveIds;
    if (!objectiveIds && typeof v.objectiveId === "string" && v.objectiveId.trim() !== "") {
      objectiveIds = [{ objectiveId: v.objectiveId }];
    }

    let configuration = v.configuration as Record<string, unknown> | undefined;
    if (v.imageUrl !== undefined) {
      configuration = {
        ...(configuration || {}),
        imageUrl: typeof v.imageUrl === "string" && v.imageUrl.trim() !== "" ? v.imageUrl.trim() : null,
      };
    }

    return {
      ...v,
      ...(questionText !== undefined && { questionText }),
      ...(points !== undefined && { points }),
      ...(configuration !== undefined && { configuration }),
      ...(topicIds !== undefined && { topicIds }),
      ...(objectiveIds !== undefined && { objectiveIds }),
    };
  }
  return val;
}, z.object({
  type: z.enum(QUESTION_TYPES).optional(),
  difficulty: z.enum(DIFFICULTY_LEVELS).optional(),
  questionText: z
    .string()
    .trim()
    .min(3, "Question text must be at least 3 characters")
    .optional(),
  explanation: z.string().trim().max(3000).optional().nullable(),
  imageUrl: z.string().trim().max(2000).optional().nullable(),
  points: z.coerce.number().positive().optional(),
  options: z.array(QuestionOptionSchema).optional(),
  configuration: z.record(z.string(), z.unknown()).optional().nullable(),
  topicIds: z.array(QuestionTopicSchema).optional(),
  objectiveIds: z.array(QuestionObjectiveSchema).optional(),
  status: z.enum(QUESTION_STATUSES).optional(),
}));

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && (v.trim() === "" || v === "ALL" || v === "undefined" || v === "null")
    ? undefined
    : v;

export const QuestionQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).default(QUESTION_BANK_PAGINATION.DEFAULT_PAGE)
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce
      .number()
      .int()
      .min(1)
      .max(QUESTION_BANK_PAGINATION.MAX_LIMIT)
      .default(QUESTION_BANK_PAGINATION.DEFAULT_LIMIT)
  ),
  status: z.preprocess(emptyToUndefined, z.enum(QUESTION_STATUSES).optional()),
  type: z.preprocess(emptyToUndefined, z.enum(QUESTION_TYPES).optional()),
  difficulty: z.preprocess(emptyToUndefined, z.enum(DIFFICULTY_LEVELS).optional()),
  topicId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  objectiveId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});
