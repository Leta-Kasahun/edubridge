import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { academicYearController } from "./controllers/academic-year.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", academicYearController.getAcademicYears);
router.get("/active", academicYearController.getActiveYear);
router.get("/:id", academicYearController.getById);
router.post("/", academicYearController.create);
router.put("/:id", academicYearController.update);
router.patch("/:id", academicYearController.update);
router.post("/:id/set-active", academicYearController.setActive);
router.post("/:id/archive", academicYearController.archive);
router.post("/:id/restore", academicYearController.restore);

export { router as academicYearRouter };
