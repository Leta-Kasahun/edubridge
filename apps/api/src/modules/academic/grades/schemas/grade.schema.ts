import { z } from "zod";

export const createGradeSchema = z.object({
  level: z
    .number()
    .int("Grade level must be an integer")
    .min(1, "Grade level must be at least 1")
    .max(12, "Grade level cannot exceed 12"),
  isActive: z.boolean().optional().default(true),
});

export const updateGradeSchema = z.object({
  isActive: z.boolean(),
});

export type CreateGradeDto = z.infer<typeof createGradeSchema>;
export type UpdateGradeDto = z.infer<typeof updateGradeSchema>;
