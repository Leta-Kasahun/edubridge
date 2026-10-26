import { z } from "zod";

export const streamExplanationQuerySchema = z.object({
  studentAnswer: z.string().trim().max(500).optional(),
});

export type StreamExplanationQuery = z.infer<typeof streamExplanationQuerySchema>;
