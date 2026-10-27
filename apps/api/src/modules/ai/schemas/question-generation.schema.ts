import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? undefined : val;

export const generateQuestionsSchema = z.object({
  scope: z.enum(["TOPIC", "UNIT", "SUBJECT", "MOCK_EXAM"]).default("TOPIC"),
  subjectId: z.string().uuid("Invalid subject ID"),
  gradeId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid grade ID").optional().nullable()),
  unitId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid unit ID").optional().nullable()),
  topicId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid topic ID").optional().nullable()),
  examContextId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid exam context ID").optional().nullable()),
  count: z.coerce.number().int().min(1).max(50).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "MIXED"]).default("MEDIUM"),
  questionType: z
    .enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER", "NUMERIC", "MIXED"])
    .default("MCQ"),
  typeDistribution: z
    .object({
      MCQ: z.coerce.number().int().min(0).max(50).optional(),
      TRUE_FALSE: z.coerce.number().int().min(0).max(50).optional(),
      SHORT_ANSWER: z.coerce.number().int().min(0).max(50).optional(),
      NUMERIC: z.coerce.number().int().min(0).max(50).optional(),
    })
    .optional(),
  questionBankId: z.preprocess(emptyToUndefined, z.string().uuid("Invalid question bank ID").optional().nullable()),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;

export const GEMINI_QUESTION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          questionText: { type: "STRING" },
          type: {
            type: "STRING",
            enum: ["MCQ", "TRUE_FALSE", "SHORT_ANSWER", "NUMERIC"],
          },
          difficulty: {
            type: "STRING",
            enum: ["EASY", "MEDIUM", "HARD"],
          },
          points: { type: "INTEGER" },
          explanation: { type: "STRING" },
          targetedObjectiveIndex: { type: "INTEGER" },
          correctAnswer: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                optionKey: {
                  type: "STRING",
                  enum: ["A", "B", "C", "D"],
                },
                optionText: { type: "STRING" },
                isCorrect: { type: "BOOLEAN" },
              },
              required: ["optionKey", "optionText", "isCorrect"],
            },
          },
        },
        required: ["questionText", "type", "difficulty", "points", "explanation"],
      },
    },
    generationNotes: { type: "STRING" },
  },
  required: ["questions"],
};
