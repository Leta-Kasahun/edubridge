import { Router } from "express";
import { EvaluationController } from "./controllers/evaluation.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  ManualGradeAttemptSchema,
  SubmitQuestionFeedbackSchema,
  StudentResultsQuerySchema,
} from "./schemas/evaluation.schema.js";

const router: Router = Router();
const evaluationController = new EvaluationController();

router.use(authenticate);

router.get(
  "/student/results",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate({ query: StudentResultsQuerySchema }),
  evaluationController.listStudentResults
);

router.get(
  "/:id/attempts/:attemptId/result",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  evaluationController.getResult
);

router.put(
  "/:id/attempts/:attemptId/manual-grade",
  requireRoles("TEACHER", "SCHOOL_ADMIN"),
  validate(ManualGradeAttemptSchema),
  evaluationController.manualGrade
);

router.post(
  "/:id/question-feedback",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate(SubmitQuestionFeedbackSchema),
  evaluationController.submitQuestionFeedback
);

export default router;
