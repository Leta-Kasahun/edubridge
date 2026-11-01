import { Router } from "express";
import { authenticate, requireRoles } from "../../middleware/index.js";
import { activityLogController } from "./controllers/activity-log.controller.js";

const activityLogRouter = Router();

activityLogRouter.use(authenticate);
activityLogRouter.use(requireRoles("SYSTEM_ADMIN", "SCHOOL_ADMIN"));

activityLogRouter.get("/", activityLogController.list);
activityLogRouter.get("/stats", activityLogController.stats);

export { activityLogRouter };

