import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { sectionController } from "./controllers/section.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", sectionController.getSections);
router.get("/:id", sectionController.getById);

router.post("/bulk", requireRoles("SCHOOL_ADMIN", "ADMIN"), sectionController.bulkCreate);
router.post("/", requireRoles("SCHOOL_ADMIN", "ADMIN"), sectionController.create);
router.patch("/:id", requireRoles("SCHOOL_ADMIN", "ADMIN"), sectionController.update);
router.patch("/:id/status", requireRoles("SCHOOL_ADMIN", "ADMIN"), sectionController.updateStatus);
router.delete("/:id", requireRoles("SCHOOL_ADMIN", "ADMIN"), sectionController.delete);

export { router as sectionRouter };

