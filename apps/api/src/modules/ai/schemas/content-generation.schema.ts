import { z } from "zod";

export const generateContentSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
  topicId: z.string().uuid("Invalid topic ID"),
  contentType: z
    .enum(["LESSON_NOTE", "SUMMARY", "STUDY_GUIDE", "WORKSHEET"])
    .default("LESSON_NOTE"),
  tone: z
    .enum(["ACADEMIC", "SIMPLIFIED", "ENGAGING"])
    .default("ENGAGING"),
  targetGradeLevel: z.coerce.number().int().min(1).max(12).optional(),
});

export type GenerateContentInput = z.infer<typeof generateContentSchema>;

export const GEMINI_CONTENT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    body: { type: "STRING" },
    sections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          heading: { type: "STRING" },
          objectiveIndex: { type: "INTEGER" },
          content: { type: "STRING" },
        },
        required: ["heading", "content"],
      },
    },
    generationNotes: { type: "STRING" },
  },
  required: ["title", "summary", "body", "sections"],
};
