import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import {
  requireGenerationRateLimit,
  requireExplanationRateLimit,
} from "./middleware/ai-rate-limiter.js";
import { explanationController } from "./controllers/explanation.controller.js";
import { questionGenerationController } from "./controllers/question-generation.controller.js";
import { contentGenerationController } from "./controllers/content-generation.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get(
  "/questions/:id/explanation/stream",
  requireRoles("STUDENT", "TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  requireExplanationRateLimit,
  explanationController.streamExplanation
);

router.post(
  "/questions/generate",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  requireGenerationRateLimit,
  questionGenerationController.generate
);

router.post(
  "/content/generate",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  requireGenerationRateLimit,
  contentGenerationController.generate
);

router.get(
  "/jobs",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  questionGenerationController.listJobs
);

router.get(
  "/jobs/:id",
  requireRoles("TEACHER", "SCHOOL_ADMIN", "ADMIN"),
  questionGenerationController.getJob
);

export { router as aiRouter };
