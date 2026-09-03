export * from "./subject.controller.js";
export * from "./unit.controller.js";
export * from "./topic.controller.js";
export * from "./objective.controller.js";
export * from "./tree.controller.js";

import { subjectController } from "./subject.controller.js";
import { unitController } from "./unit.controller.js";
import { topicController } from "./topic.controller.js";
import { objectiveController } from "./objective.controller.js";
import { treeController } from "./tree.controller.js";

export const structureController = {
  getSubjectsByVersion: subjectController.getSubjectsByVersion.bind(subjectController),
  createSubject: subjectController.createSubject.bind(subjectController),
  deleteSubject: subjectController.deleteSubject.bind(subjectController),

  getUnitsBySubject: unitController.getUnitsBySubject.bind(unitController),
  getUnitById: unitController.getUnitById.bind(unitController),
  createUnit: unitController.createUnit.bind(unitController),
  updateUnit: unitController.updateUnit.bind(unitController),
  deleteUnit: unitController.deleteUnit.bind(unitController),

  getTopicsByUnit: topicController.getTopicsByUnit.bind(topicController),
  getTopicById: topicController.getTopicById.bind(topicController),
  createTopic: topicController.createTopic.bind(topicController),
  updateTopic: topicController.updateTopic.bind(topicController),
  deleteTopic: topicController.deleteTopic.bind(topicController),

  getObjectivesByTopic: objectiveController.getObjectivesByTopic.bind(objectiveController),
  getObjectiveById: objectiveController.getObjectiveById.bind(objectiveController),
  createObjective: objectiveController.createObjective.bind(objectiveController),
  updateObjective: objectiveController.updateObjective.bind(objectiveController),
  deleteObjective: objectiveController.deleteObjective.bind(objectiveController),

  reorder: treeController.reorder.bind(treeController),
  getStructureTree: treeController.getStructureTree.bind(treeController),
};
