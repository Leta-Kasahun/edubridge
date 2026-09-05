import { Router } from "express";
import { authenticate } from "../../../../middleware/auth.js";
import { requireRoles } from "../../../../middleware/rbac.js";
import { studentAssignmentController } from "./controllers/student-assignment.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/roster", studentAssignmentController.getRoster);
router.get("/sections-capacity", studentAssignmentController.getGradeSectionsCapacity);
router.get("/:studentId/history", studentAssignmentController.getStudentEnrollmentHistory);

router.post("/:studentId/transfer", requireRoles("SCHOOL_ADMIN", "ADMIN", "TEACHER"), studentAssignmentController.transferSingle);
router.post("/bulk-transfer", requireRoles("SCHOOL_ADMIN", "ADMIN", "TEACHER"), studentAssignmentController.transferBulk);
router.get("/promotion-preview", requireRoles("SCHOOL_ADMIN", "ADMIN", "TEACHER"), studentAssignmentController.getPromotionPreview);
router.post("/commit-promotion", requireRoles("SCHOOL_ADMIN", "ADMIN", "TEACHER"), studentAssignmentController.commitPromotion);
router.post("/:studentId/withdraw", requireRoles("SCHOOL_ADMIN", "ADMIN", "TEACHER"), studentAssignmentController.withdrawStudent);

export const studentAssignmentRouter: Router = router;
