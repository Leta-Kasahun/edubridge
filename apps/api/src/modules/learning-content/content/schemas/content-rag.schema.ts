import { z } from "zod";

export const ingestContentSchema = z.object({
  attachmentIds: z.array(z.string().uuid("Invalid attachment ID format")).optional(),
});

export const hybridSearchSchema = z.object({
  query: z.string().trim().min(2, "Search query must be at least 2 characters").max(500),
  topicId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type IngestContentInput = z.infer<typeof ingestContentSchema>;
export type HybridSearchInput = z.infer<typeof hybridSearchSchema>;
