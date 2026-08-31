import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { subjectController } from "./controllers/subject.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", (req, res) => subjectController.listSubjects(req, res));
router.post("/", (req, res) => subjectController.createSubject(req, res));
router.get("/:id", (req, res) => subjectController.getSubjectById(req, res));
router.put("/:id", (req, res) => subjectController.updateSubject(req, res));
router.post("/:id/toggle-status", (req, res) => subjectController.toggleSubjectStatus(req, res));
router.post("/:id/assign-grades", (req, res) => subjectController.assignGrades(req, res));

export const subjectRoutes: Router = router;
