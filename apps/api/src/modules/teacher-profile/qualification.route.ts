import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { teacherQualificationController } from "./controllers/teacher-qualification.controller.js";
import {
  createTeacherQualificationSchema,
  updateTeacherQualificationSchema,
} from "./schemas/teacher-qualification.schema.js";

const router: Router = Router();

router.use(authenticate);

router.get("/me", teacherQualificationController.getMyQualifications);
router.post(
  "/",
  validate(createTeacherQualificationSchema),
  teacherQualificationController.create
);
router.patch(
  "/:id",
  validate(updateTeacherQualificationSchema),
  teacherQualificationController.update
);
router.delete("/:id", teacherQualificationController.delete);
router.get("/:id", teacherQualificationController.getById);

export { router as teacherQualificationRouter };
