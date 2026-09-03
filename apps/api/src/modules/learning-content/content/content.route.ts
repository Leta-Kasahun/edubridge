import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { contentController } from "./controllers/content.controller.js";
import { contentAttachmentController } from "./controllers/content-attachment.controller.js";

const router: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

router.use(authenticate);

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
  "/:id/publish",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  contentController.publishContent
);
router.post(
  "/:id/archive",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  contentController.archiveContent
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
