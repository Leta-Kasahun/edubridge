import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { gradeController } from "./controllers/grade.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", gradeController.getGrades);
router.get("/:id", gradeController.getById);
router.post("/", gradeController.create);
router.patch("/:id/toggle-status", gradeController.toggleActive);

export { router as gradeRouter };
