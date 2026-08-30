import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { teacherExperienceController } from "./controllers/teacher-experience.controller.js";
import {
  createTeacherExperienceSchema,
  updateTeacherExperienceSchema,
} from "./schemas/teacher-experience.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/me", teacherExperienceController.getMyExperiences);
router.post(
  "/",
  validate(createTeacherExperienceSchema),
  teacherExperienceController.create
);
router.patch(
  "/:id",
  validate(updateTeacherExperienceSchema),
  teacherExperienceController.update
);
router.delete("/:id", teacherExperienceController.delete);
router.get("/:id", teacherExperienceController.getById);

export { router as teacherExperienceRouter };
