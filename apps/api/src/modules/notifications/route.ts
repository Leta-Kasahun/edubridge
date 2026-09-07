import { Router } from "express";
import { authenticate, requireTenant, requireRoles, validate } from "../../middleware/index.js";
import { notificationController } from "./controllers/notification.controller.js";
import { sseHandler } from "./controllers/sse.controller.js";
import {
  listNotificationsSchema,
  markReadSchema,
  upsertPreferenceSchema,
  createNotificationSchema,
} from "./schemas/notification.schema.js";

const router = Router();

// ── SSE stream ────────────────────────────────────────────────────────────────
// Auth + tenant are resolved inside sseHandler from the token,
// allowing standard browser EventSource (no custom headers).
router.get("/stream", sseHandler);

// ── All other routes ──────────────────────────────────────────────────────────
router.get("/", authenticate, requireTenant, notificationController.list);

router.get("/unread-count", authenticate, requireTenant, notificationController.unreadCount);

router.patch(
  "/mark-read",
  authenticate,
  requireTenant,
  validate(markReadSchema),
  notificationController.markRead
);

router.patch("/mark-all-read", authenticate, requireTenant, notificationController.markAllRead);

router.get("/preferences", authenticate, notificationController.getPreferences);

router.put(
  "/preferences",
  authenticate,
  validate(upsertPreferenceSchema),
  notificationController.upsertPreference
);

router.post(
  "/send",
  authenticate,
  requireTenant,
  requireRoles("SCHOOL_ADMIN", "SYSTEM_ADMIN"),
  validate(createNotificationSchema),
  notificationController.send
);

export { router as notificationRouter };
