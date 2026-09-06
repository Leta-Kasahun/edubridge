import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { gradeController } from "./controllers/grade.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", gradeController.getGrades);
router.get("/:id", gradeController.getById);

router.post("/", requireRoles("SCHOOL_ADMIN", "ADMIN"), gradeController.create);
router.patch("/:id/toggle-status", requireRoles("SCHOOL_ADMIN", "ADMIN"), gradeController.toggleActive);

export { router as gradeRouter };

