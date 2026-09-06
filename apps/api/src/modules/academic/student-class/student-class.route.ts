import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { studentClassController } from "./controllers/student-class.controller.js";

const router: Router = Router();

router.use(authenticate);
router.get("/my-class", studentClassController.getMyClass);

export const studentClassRouter: Router = router;
