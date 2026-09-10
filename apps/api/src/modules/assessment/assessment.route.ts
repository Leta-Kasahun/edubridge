import { Router } from "express";
import { AssessmentController } from "./controllers/assessment.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  AssessmentQuerySchema,
  AddAssessmentQuestionsSchema,
  AssignAssessmentSchema,
} from "./schemas/assessment.schema.js";

const router: Router = Router();
const assessmentController = new AssessmentController();

router.use(authenticate);

router.get(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  validate({ query: AssessmentQuerySchema }),
  assessmentController.list
);

router.post(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(CreateAssessmentSchema),
  assessmentController.create
);

router.get(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  assessmentController.getById
);

router.put(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateAssessmentSchema),
  assessmentController.update
);

router.patch(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(UpdateAssessmentSchema),
  assessmentController.update
);

router.put(
  "/:id/questions",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(AddAssessmentQuestionsSchema),
  assessmentController.setQuestions
);

router.post(
  "/:id/assign",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(AssignAssessmentSchema),
  assessmentController.assign
);

router.post(
  "/:id/publish",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  assessmentController.publish
);

router.delete(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  assessmentController.archive
);

export default router;
