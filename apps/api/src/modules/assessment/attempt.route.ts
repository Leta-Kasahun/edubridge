import { Router } from "express";
import { AttemptController } from "./controllers/attempt.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  StartAttemptSchema,
  SaveAnswerSchema,
  BatchSaveAnswersSchema,
  SubmitAttemptSchema,
  AttemptQuerySchema,
} from "./schemas/attempt.schema.js";

const router: Router = Router();
const attemptController = new AttemptController();

router.use(authenticate);

router.get(
  "/student/in-progress",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  attemptController.listStudentInProgress
);

router.post(
  "/:id/attempts/start",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate(StartAttemptSchema),
  attemptController.start
);

router.put(
  "/:id/attempts/:attemptId/answers",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate(SaveAnswerSchema),
  attemptController.saveAnswer
);

router.post(
  "/:id/attempts/:attemptId/answers/batch",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate(BatchSaveAnswersSchema),
  attemptController.batchSaveAnswers
);

router.post(
  "/:id/attempts/:attemptId/submit",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN"),
  validate(SubmitAttemptSchema),
  attemptController.submit
);

router.get(
  "/:id/attempts",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "STUDENT"),
  validate({ query: AttemptQuerySchema }),
  attemptController.listAttempts
);

export default router;
