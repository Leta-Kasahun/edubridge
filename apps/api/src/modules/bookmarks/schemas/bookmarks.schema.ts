import { z } from "zod";

export const toggleBookmarkSchema = z.object({
  targetType: z.enum(["QUESTION", "TOPIC", "LEARNING_CONTENT"]).default("QUESTION"),
  targetId: z.string().uuid("Target ID must be a valid UUID"),
  note: z.string().max(500, "Note must not exceed 500 characters").nullish(),
});

export const checkBookmarksSchema = z.object({
  targetType: z.enum(["QUESTION", "TOPIC", "LEARNING_CONTENT"]).default("QUESTION"),
  targetIds: z
    .array(z.string().uuid("Each target ID must be a valid UUID"))
    .min(1, "At least one target ID is required")
    .max(100, "Maximum 100 IDs allowed per check"),
});

export const listBookmarksQuerySchema = z.object({
  targetType: z.enum(["QUESTION", "TOPIC", "LEARNING_CONTENT"]).optional(),
  subjectId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const bookmarkIdParamSchema = z.object({
  id: z.string().uuid("Bookmark ID must be a valid UUID"),
});

export type ToggleBookmarkDto = z.infer<typeof toggleBookmarkSchema>;
export type CheckBookmarksDto = z.infer<typeof checkBookmarksSchema>;
export type ListBookmarksQueryDto = z.infer<typeof listBookmarksQuerySchema>;
export type BookmarkIdParamDto = z.infer<typeof bookmarkIdParamSchema>;
