import { z } from "zod";

export const activityLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  resource: z.string().trim().optional(),
  action: z.string().trim().optional(),
  tenantId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z
    .string()
    .trim()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid startDate format",
    })
    .optional(),
  endDate: z
    .string()
    .trim()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid endDate format",
    })
    .optional(),
});

export type ActivityLogQueryDto = z.infer<typeof activityLogQuerySchema>;

