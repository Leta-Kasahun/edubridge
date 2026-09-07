import { routeRegistry } from "../../docs/route.registry.js";
import {
  listNotificationsSchema,
  markReadSchema,
  upsertPreferenceSchema,
  createNotificationSchema,
} from "./schemas/notification.schema.js";

export const registerNotificationDocs = () => {
  routeRegistry.registerTag(
    "Notifications",
    "Real-time in-app notifications via SSE + Redis Pub/Sub"
  );

  routeRegistry.register({
    path: "/notifications/stream",
    method: "GET",
    description: "SSE stream — connect to receive real-time notifications. Pass ?token=<jwt>.",
    tags: ["Notifications"],
    security: false,
    parameters: [
      {
        name: "token",
        in: "query",
        required: true,
        schema: { type: "string" },
        description: "JWT access token (required because EventSource cannot set headers)",
      },
    ],
    responses: {
      200: { description: "SSE stream opened" },
      401: { description: "Invalid or missing token" },
    },
  });

  routeRegistry.register({
    path: "/notifications",
    method: "GET",
    description: "List notifications for the authenticated user",
    tags: ["Notifications"],
    security: true,
    requestBody: listNotificationsSchema,
    parameters: [
      { name: "isRead", in: "query", schema: { type: "boolean" }, description: "Filter by read status" },
      { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category" },
      { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number" },
      { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Page size (max 100)" },
    ],
  });

  routeRegistry.register({
    path: "/notifications/unread-count",
    method: "GET",
    description: "Get unread notification count for the authenticated user",
    tags: ["Notifications"],
    security: true,
  });

  routeRegistry.register({
    path: "/notifications/mark-read",
    method: "PATCH",
    description: "Mark specific notifications as read",
    tags: ["Notifications"],
    security: true,
    requestBody: markReadSchema,
  });

  routeRegistry.register({
    path: "/notifications/mark-all-read",
    method: "PATCH",
    description: "Mark all notifications as read for the authenticated user",
    tags: ["Notifications"],
    security: true,
  });

  routeRegistry.register({
    path: "/notifications/preferences",
    method: "GET",
    description: "Get notification channel preferences for the authenticated user",
    tags: ["Notifications"],
    security: true,
  });

  routeRegistry.register({
    path: "/notifications/preferences",
    method: "PUT",
    description: "Upsert a notification channel preference",
    tags: ["Notifications"],
    security: true,
    requestBody: upsertPreferenceSchema,
  });

  routeRegistry.register({
    path: "/notifications/send",
    method: "POST",
    description: "Send a notification to a user (SCHOOL_ADMIN / SYSTEM_ADMIN only)",
    tags: ["Notifications"],
    security: true,
    requestBody: createNotificationSchema,
  });
};
