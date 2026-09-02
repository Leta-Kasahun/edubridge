import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { curriculumController } from "./controllers/curriculum.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", curriculumController.getCurricula);
router.get("/:id", curriculumController.getById);
router.post("/", curriculumController.create);
router.put("/:id", curriculumController.update);
router.patch("/:id/status", curriculumController.changeStatus);
router.post("/:id/versions", curriculumController.createVersion);
router.put("/:id/versions/:versionId", curriculumController.updateVersion);
router.patch(
  "/:id/versions/:versionId/status",
  curriculumController.changeVersionStatus
);

export { router as curriculumRouter };
