import { z } from "zod";
import {
  QUESTION_BANK_STATUSES,
  QUESTION_BANK_PAGINATION,
} from "../../../shared/constants/question-bank.constants.js";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && (v.trim() === "" || v === "ALL" || v === "undefined" || v === "null")
    ? undefined
    : v;

export const CreateQuestionBankSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(200, "Name must not exceed 200 characters"),
  description: z.string().trim().max(2000).optional().nullable(),
  examContextId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Exam Context ID").optional().nullable()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Subject ID").optional().nullable()),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Grade ID").optional().nullable()),
});

export const UpdateQuestionBankSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(200, "Name must not exceed 200 characters")
    .optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.preprocess(emptyToUndefined, z.enum(QUESTION_BANK_STATUSES).optional()),
  examContextId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Exam Context ID").optional().nullable()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Subject ID").optional().nullable()),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Grade ID").optional().nullable()),
});

export const QuestionBankQuerySchema = z.object({
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
  status: z.preprocess(emptyToUndefined, z.enum(QUESTION_BANK_STATUSES).optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  examContextId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  createdById: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
});
