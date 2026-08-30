import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { teacherDirectoryController } from "./controllers/teacher-directory.controller.js";

const router: Router = Router();

router.use(authenticate);

router.get("/", teacherDirectoryController.getDirectory);

export { router as teacherDirectoryRouter };
