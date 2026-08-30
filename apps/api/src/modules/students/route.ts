import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { studentProfileController } from "./controllers/student-profile.controller.js";
import {
  completeStudentProfileSchema,
  updateStudentProfileSchema,
} from "./schemas/student-profile.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/me", studentProfileController.getMyProfile);

router.post(
  "/complete",
  validate(completeStudentProfileSchema),
  studentProfileController.completeProfile
);

router.patch(
  "/me",
  validate(updateStudentProfileSchema),
  studentProfileController.updateMyProfile
);

router.get("/:id", studentProfileController.getProfileById);

export { router as studentProfileRouter };
