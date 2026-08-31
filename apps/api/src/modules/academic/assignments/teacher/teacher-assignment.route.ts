import { Router } from "express";
import { authenticate } from "../../../../middleware/auth.js";
import { teacherAssignmentController } from "./controllers/teacher-assignment.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", teacherAssignmentController.getAssignments);
router.post("/", teacherAssignmentController.createAssignment);
router.post("/:id/reassign", teacherAssignmentController.reassignAssignment);
router.post("/:id/end", teacherAssignmentController.endAssignment);
router.get("/load/:teacherId", teacherAssignmentController.getTeacherLoadSummary);

export const teacherAssignmentRouter: Router = router;
