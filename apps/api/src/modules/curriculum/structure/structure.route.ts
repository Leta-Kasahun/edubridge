import { Router } from "express";
import { authenticate } from "../../../middleware/auth.js";
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
router.post("/subjects", subjectController.createSubject);
router.delete("/subjects/:subjectId", subjectController.deleteSubject);

router.get("/subjects/:subjectId/units", unitController.getUnitsBySubject);
router.get("/units/:unitId", unitController.getUnitById);
router.post("/units", unitController.createUnit);
router.put("/units/:unitId", unitController.updateUnit);
router.delete("/units/:unitId", unitController.deleteUnit);

router.get("/units/:unitId/topics", topicController.getTopicsByUnit);
router.get("/topics/:topicId", topicController.getTopicById);
router.post("/topics", topicController.createTopic);
router.put("/topics/:topicId", topicController.updateTopic);
router.delete("/topics/:topicId", topicController.deleteTopic);

router.get("/topics/:topicId/objectives", objectiveController.getObjectivesByTopic);
router.get("/objectives/:objectiveId", objectiveController.getObjectiveById);
router.post("/objectives", objectiveController.createObjective);
router.put("/objectives/:objectiveId", objectiveController.updateObjective);
router.delete("/objectives/:objectiveId", objectiveController.deleteObjective);

router.post("/reorder", treeController.reorder);

router.get("/versions/:versionId/tree", treeController.getStructureTree);

export { router as structureRouter };
