import { z } from "zod";

export const createLookupSchema = z.object({
  category: z.string().trim().min(1).max(50),
  key: z.string().trim().min(1).max(100),
  value: z.any(),
  description: z.string().max(255).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateLookupSchema = createLookupSchema.partial();

export type CreateLookupDto = z.infer<typeof createLookupSchema>;
export type UpdateLookupDto = z.infer<typeof updateLookupSchema>;
