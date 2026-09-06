import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { subjectController } from "./controllers/subject.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", subjectController.listSubjects);
router.get("/:id", subjectController.getSubjectById);

router.post("/", requireRoles("SCHOOL_ADMIN", "ADMIN"), subjectController.createSubject);
router.put("/:id", requireRoles("SCHOOL_ADMIN", "ADMIN"), subjectController.updateSubject);
router.post("/:id/toggle-status", requireRoles("SCHOOL_ADMIN", "ADMIN"), subjectController.toggleSubjectStatus);
router.post("/:id/assign-grades", requireRoles("SCHOOL_ADMIN", "ADMIN"), subjectController.assignGrades);

export const subjectRoutes: Router = router;

