import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
import { requireRoles } from "../../../middleware/rbac.js";
import {
  subjectController,
  unitController,
  topicController,
  objectiveController,
  treeController,
} from "./controllers/index.js";

const router: Router = Router();

router.use(authenticate);

router.get("/versions/:versionId/subjects", subjectController.getSubjectsByVersion);
router.post(
  "/subjects",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  subjectController.createSubject
);
router.delete(
  "/subjects/:subjectId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  subjectController.deleteSubject
);

router.get("/subjects/:subjectId/units", unitController.getUnitsBySubject);
router.get("/units/:unitId", unitController.getUnitById);
router.post(
  "/units",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  unitController.createUnit
);
router.put(
  "/units/:unitId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  unitController.updateUnit
);
router.delete(
  "/units/:unitId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  unitController.deleteUnit
);

router.get("/units/:unitId/topics", topicController.getTopicsByUnit);
router.get("/topics/:topicId", topicController.getTopicById);
router.post(
  "/topics",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  topicController.createTopic
);
router.put(
  "/topics/:topicId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  topicController.updateTopic
);
router.delete(
  "/topics/:topicId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  topicController.deleteTopic
);

router.get("/topics/:topicId/objectives", objectiveController.getObjectivesByTopic);
router.get("/objectives/:objectiveId", objectiveController.getObjectiveById);
router.post(
  "/objectives",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  objectiveController.createObjective
);
router.put(
  "/objectives/:objectiveId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  objectiveController.updateObjective
);
router.delete(
  "/objectives/:objectiveId",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  objectiveController.deleteObjective
);

router.post(
  "/reorder",
  requireRoles("SCHOOL_ADMIN", "ADMIN"),
  treeController.reorder
);

router.get("/versions/:versionId/tree", treeController.getStructureTree);

export { router as structureRouter };
