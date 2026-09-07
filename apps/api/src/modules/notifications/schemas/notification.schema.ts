import { z } from "zod";

const categoryEnum = z.enum([
  "ACADEMIC",
  "ASSESSMENT",
  "CONTENT",
  "TEACHER",
  "SECURITY",
  "SYSTEM",
]);

const channelEnum = z.enum(["IN_APP", "EMAIL", "SMS"]);

const priorityEnum = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  category: categoryEnum,
  priority: priorityEnum.optional(),
  title: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1).max(2000),
  actionUrl: z.string().url().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  sourceType: z.string().max(100).optional().nullable(),
  sourceId: z.string().uuid().optional().nullable(),
  channels: z.array(channelEnum).optional(),
});

export const listNotificationsSchema = z.object({
  isRead: z.enum(["true", "false"]).optional(),
  category: categoryEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export const upsertPreferenceSchema = z.object({
  category: categoryEnum,
  channel: channelEnum,
  enabled: z.boolean(),
});

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
export type ListNotificationsDto = z.infer<typeof listNotificationsSchema>;
export type MarkReadDto = z.infer<typeof markReadSchema>;
export type UpsertPreferenceDto = z.infer<typeof upsertPreferenceSchema>;
