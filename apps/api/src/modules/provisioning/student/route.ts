import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import { validate } from "../../../middleware/validate.js";
import { studentProvisioningController } from "./controllers/student-provisioning.controller.js";
import {
  provisionStudentSchema,
  bulkStudentCsvSchema,
  createGradeSchema,
  createSectionSchema,
} from "./schemas/student-provisioning.schema.js";

const router: Router = Router();

router.use(authenticate, requireRoles("SCHOOL_ADMIN", "SYSTEM_ADMIN", "TEACHER"));

router.get("/academic-structure", studentProvisioningController.getAcademicStructure);

router.post(
  "/grades",
  validate(createGradeSchema),
  studentProvisioningController.createGrade
);

router.post(
  "/sections",
  validate(createSectionSchema),
  studentProvisioningController.createSection
);

router.post(
  "/",
  validate(provisionStudentSchema),
  studentProvisioningController.provisionStudent
);

router.post(
  "/bulk-csv",
  validate(bulkStudentCsvSchema),
  studentProvisioningController.bulkProvisionCsv
);

router.get("/", studentProvisioningController.getStudents);

router.get("/:id", studentProvisioningController.getStudentById);

router.patch("/:id/deactivate", studentProvisioningController.deactivateStudent);

router.patch("/:id/activate", studentProvisioningController.activateStudent);

export { router as studentProvisioningRouter };
