import { Router } from "express";
import multer from "multer";
import { authenticate, optionalAuthenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { contentController } from "./controllers/content.controller.js";
import { contentAttachmentController } from "./controllers/content-attachment.controller.js";
import { createB2MulterStorage } from "./utils/b2-multer.storage.js";
import { MAX_ATTACHMENT_SIZE_BYTES } from "../../../shared/constants/learning-content.constants.js";

const router: Router = Router();

const upload = multer({
  storage: createB2MulterStorage(),
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE_BYTES,
  },
});

router.get(
  "/:id/attachments/:attachmentId/stream",
  optionalAuthenticate,
  contentAttachmentController.streamAttachment
);
router.get(
  "/:id/attachments/:attachmentId/download",
  optionalAuthenticate,
  contentAttachmentController.streamAttachment
);

router.use(authenticate);

router.get("/student/in-progress", contentController.listStudentInProgress);
router.get("/:id/progress", contentController.getProgress);
router.put("/:id/progress", contentController.saveProgress);

router.get("/", contentController.listContent);
router.get("/:id", contentController.getContentDetail);
router.post(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentController.createContent
);
router.patch(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentController.updateMetadata
);
router.put(
  "/:id/mappings",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentController.updateMappings
);
router.post(
  "/:id/versions",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentController.saveNewVersion
);
router.get("/:id/versions", contentController.getVersions);
router.get(
  "/:id/versions/:versionNumber",
  contentController.getVersionByNumber
);

router.post(
  "/:id/submit",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  contentController.submitForReview
);
router.post(
  "/:id/approve",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  contentController.approveContent
);
router.post(
  "/:id/publish",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  contentController.publishContent
);
router.post(
  "/:id/archive",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  contentController.archiveContent
);
router.post(
  "/:id/activate",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  contentController.activateContent
);
router.delete(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentController.deleteContent
);

router.get("/:id/attachments", contentAttachmentController.getAttachments);
router.post(
  "/:id/attachments",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  upload.single("file"),
  contentAttachmentController.uploadAttachment
);
router.delete(
  "/:id/attachments/:attachmentId",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentAttachmentController.deleteAttachment
);

export { router as contentRouter };
