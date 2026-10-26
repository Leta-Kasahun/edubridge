import { z } from "zod";

export const generateQuestionsSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
  topicId: z.string().uuid("Invalid topic ID"),
  count: z.coerce.number().int().min(1).max(20).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  questionType: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]).default("MCQ"),
  questionBankId: z.string().uuid("Invalid question bank ID").optional(),
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
            enum: ["MCQ", "TRUE_FALSE", "SHORT_ANSWER"],
          },
          difficulty: {
            type: "STRING",
            enum: ["EASY", "MEDIUM", "HARD"],
          },
          points: { type: "INTEGER" },
          explanation: { type: "STRING" },
          targetedObjectiveIndex: { type: "INTEGER" },
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
