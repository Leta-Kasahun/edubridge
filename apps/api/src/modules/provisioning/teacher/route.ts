import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { validate } from "../../../middleware/validate.js";
import { teacherProvisioningController } from "./controllers/teacher-provisioning.controller.js";
import {
  provisionTeacherInviteSchema,
  provisionTeacherDirectSchema,
  provisionTeacherSchema,
  bulkProvisionTeachersSchema,
  bulkTeacherCsvSchema,
} from "./schemas/teacher-provisioning.schema.js";

const router: Router = Router();

router.use(authenticate, requireRoles("SCHOOL_ADMIN", "SYSTEM_ADMIN"));

router.post(
  "/invite",
  validate(provisionTeacherInviteSchema),
  teacherProvisioningController.inviteTeacher
);

router.post(
  "/direct",
  validate(provisionTeacherDirectSchema),
  teacherProvisioningController.createTeacherDirect
);

router.post(
  "/",
  validate(provisionTeacherSchema),
  teacherProvisioningController.provisionTeacher
);

router.post(
  "/bulk",
  validate(bulkProvisionTeachersSchema),
  teacherProvisioningController.bulkProvisionTeachers
);

router.post(
  "/bulk-csv",
  validate(bulkTeacherCsvSchema),
  teacherProvisioningController.bulkProvisionCsv
);

router.get("/", teacherProvisioningController.getTeachers);

router.get("/:id", teacherProvisioningController.getTeacherById);

router.patch("/:id/deactivate", teacherProvisioningController.deactivateTeacher);

router.patch("/:id/activate", teacherProvisioningController.activateTeacher);

export { router as teacherProvisioningRouter };
