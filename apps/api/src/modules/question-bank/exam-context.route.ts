import { Router } from "express";
import { ExamContextController } from "./controllers/exam-context.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  CreateExamContextSchema,
  UpdateExamContextSchema,
  ExamContextQuerySchema,
} from "./schemas/exam-context.schema.js";

const router: Router = Router();
const controller = new ExamContextController();

router.use(authenticate);

router.post(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate(CreateExamContextSchema),
  controller.create
);

router.get(
  "/",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  validate({ query: ExamContextQuerySchema }),
  controller.list
);

router.get(
  "/:id",
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  controller.getById
);

router.put(
  "/:id",
  requireRoles("SCHOOL_ADMIN"),
  validate(UpdateExamContextSchema),
  controller.update
);

router.patch(
  "/:id",
  requireRoles("SCHOOL_ADMIN"),
  validate(UpdateExamContextSchema),
  controller.update
);

router.delete(
  "/:id",
  requireRoles("SCHOOL_ADMIN"),
  controller.delete
);

export const examContextRouter = router;
