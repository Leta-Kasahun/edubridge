import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { sectionController } from "./controllers/section.controller.js";

const router: Router = Router();

router.use(authenticate);

router.post("/bulk", sectionController.bulkCreate);
router.get("/", sectionController.getSections);
router.get("/:id", sectionController.getById);
router.post("/", sectionController.create);
router.patch("/:id", sectionController.update);
router.patch("/:id/status", sectionController.updateStatus);
router.delete("/:id", sectionController.delete);

export { router as sectionRouter };
