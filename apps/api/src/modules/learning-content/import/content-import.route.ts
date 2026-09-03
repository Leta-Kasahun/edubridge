import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { contentImportController } from "./controllers/content-import.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/template", contentImportController.getSampleTemplate);
router.post(
  "/preview",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "ADMIN"),
  contentImportController.previewImport
);
router.post(
  "/commit",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  contentImportController.commitImport
);

export { router as contentImportRouter };
