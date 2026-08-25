import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { teacherProfileController } from "./controllers/teacher-profile.controller.js";
import {
  completeTeacherProfileSchema,
  updateTeacherProfileSchema,
} from "./schemas/teacher-profile.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/me", teacherProfileController.getMyProfile);

router.post(
  "/complete",
  validate(completeTeacherProfileSchema),
  teacherProfileController.completeProfile
);

router.patch(
  "/me",
  validate(updateTeacherProfileSchema),
  teacherProfileController.updateMyProfile
);

router.get("/:id", teacherProfileController.getProfileById);

export { router as teacherProfileRouter };
