import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { curriculumImportController } from "./controllers/curriculum-import.controller.js";

const router: Router = Router();

router.use(authenticate);

router.post("/preview", curriculumImportController.previewImport);
router.post("/commit", curriculumImportController.commitImport);
router.get("/template", curriculumImportController.getSampleTemplate);

export { router as curriculumImportRouter };
