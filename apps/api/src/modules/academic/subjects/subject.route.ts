import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { subjectController } from "./controllers/subject.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", subjectController.listSubjects);
router.post("/", subjectController.createSubject);
router.get("/:id", subjectController.getSubjectById);
router.put("/:id", subjectController.updateSubject);
router.post("/:id/toggle-status", subjectController.toggleSubjectStatus);
router.post("/:id/assign-grades", subjectController.assignGrades);

export const subjectRoutes: Router = router;
