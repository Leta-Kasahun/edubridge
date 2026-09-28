import { Router } from "express";
import { MasteryController } from "./controllers/mastery.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import {
  sectionMasteryQuerySchema,
  studentMasteryQuerySchema,
} from "./schemas/mastery.schema.js";

const router: Router = Router();
const controller = new MasteryController();

router.use(authenticate);

router.get(
  "/sections/:sectionId",
  requireRoles("SCHOOL_ADMIN", "TEACHER", "SYSTEM_ADMIN"),
  validate({ query: sectionMasteryQuerySchema }),
  controller.getSectionMasteryMatrix
);

router.get(
  "/students/:studentId",
  validate({ query: studentMasteryQuerySchema }),
  controller.getStudentMastery
);

router.get(
  "/students/:studentId/topics/:topicId/history",
  controller.getTopicMasteryHistory
);

export { router as masteryRouter };
