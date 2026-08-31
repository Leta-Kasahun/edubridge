import { Router } from "express";
import { authenticate } from "../../../../middleware/auth.js";
import { studentAssignmentController } from "./controllers/student-assignment.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/roster", studentAssignmentController.getRoster);
router.get("/sections-capacity", studentAssignmentController.getGradeSectionsCapacity);
router.post("/:studentId/transfer", studentAssignmentController.transferSingle);
router.post("/bulk-transfer", studentAssignmentController.transferBulk);
router.get("/promotion-preview", studentAssignmentController.getPromotionPreview);
router.post("/commit-promotion", studentAssignmentController.commitPromotion);
router.post("/:studentId/withdraw", studentAssignmentController.withdrawStudent);
router.get("/:studentId/history", studentAssignmentController.getStudentEnrollmentHistory);

export const studentAssignmentRouter: Router = router;
