import { z } from "zod";
import {
  EXAM_SCOPES,
  EXAM_CONTEXT_STATUSES,
  QUESTION_BANK_PAGINATION,
} from "../../../shared/constants/question-bank.constants.js";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && (v.trim() === "" || v === "ALL" || v === "undefined" || v === "null")
    ? undefined
    : v;

const parseYear = (v: unknown): number | null | undefined => {
  if (v === null || v === undefined || v === "") return null;
  const num = Number(v);
  return isNaN(num) ? null : num;
};

export const CreateExamContextSchema = z.preprocess((val) => {
  if (typeof val === "object" && val !== null) {
    const v = val as Record<string, unknown>;
    const examYear = parseYear(v.examYear ?? v.year);
    return {
      ...v,
      examYear: examYear ?? undefined,
    };
  }
  return val;
}, z.object({
  name: z
    .string()
    .trim()
    .min(3, "Exam context name must be at least 3 characters")
    .max(200),
  scope: z.enum(EXAM_SCOPES),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Grade ID").optional().nullable()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Subject ID").optional().nullable()),
  examYear: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .nullable(),
  regionName: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional().nullable()),
  authorityName: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional().nullable()),
  curriculumVersionId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Invalid Curriculum Version ID").optional().nullable()
  ),
}));

export const UpdateExamContextSchema = z.preprocess((val) => {
  if (typeof val === "object" && val !== null) {
    const v = val as Record<string, unknown>;
    const rawYear = v.examYear !== undefined ? v.examYear : v.year;
    const examYear = rawYear !== undefined ? parseYear(rawYear) : undefined;
    return {
      ...v,
      ...(examYear !== undefined && { examYear }),
    };
  }
  return val;
}, z.object({
  name: z
    .string()
    .trim()
    .min(3, "Exam context name must be at least 3 characters")
    .max(200)
    .optional(),
  scope: z.enum(EXAM_SCOPES).optional(),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Grade ID").optional().nullable()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid Subject ID").optional().nullable()),
  examYear: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .nullable(),
  regionName: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional().nullable()),
  authorityName: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional().nullable()),
  curriculumVersionId: z.preprocess(
    emptyToUndefined,
    z.string().uuid("Invalid Curriculum Version ID").optional().nullable()
  ),
  status: z.enum(EXAM_CONTEXT_STATUSES).optional(),
}));

export const ExamContextQuerySchema = z.object({
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
  scope: z.preprocess(emptyToUndefined, z.enum(EXAM_SCOPES).optional()),
  status: z.preprocess(emptyToUndefined, z.enum(EXAM_CONTEXT_STATUSES).optional()),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  subjectId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  examYear: z.preprocess(emptyToUndefined, z.coerce.number().int().optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});
