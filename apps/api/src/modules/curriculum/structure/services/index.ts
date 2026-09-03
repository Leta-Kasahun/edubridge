export * from "./structure-access.service.js";
export * from "./subject.service.js";
export * from "./unit.service.js";
export * from "./topic.service.js";
export * from "./objective.service.js";
export * from "./tree.service.js";

import { subjectService } from "./subject.service.js";
import { unitService } from "./unit.service.js";
import { topicService } from "./topic.service.js";
import { objectiveService } from "./objective.service.js";
import { treeService } from "./tree.service.js";

export const structureService = {
  getSubjectsByVersion: subjectService.getSubjectsByVersion.bind(subjectService),
  createSubject: subjectService.createSubject.bind(subjectService),
  deleteSubject: subjectService.deleteSubject.bind(subjectService),

  getUnitsBySubject: unitService.getUnitsBySubject.bind(unitService),
  getUnitById: unitService.getUnitById.bind(unitService),
  createUnit: unitService.createUnit.bind(unitService),
  updateUnit: unitService.updateUnit.bind(unitService),
  deleteUnit: unitService.deleteUnit.bind(unitService),
  reorderUnits: unitService.reorderUnits.bind(unitService),

  getTopicsByUnit: topicService.getTopicsByUnit.bind(topicService),
  getTopicById: topicService.getTopicById.bind(topicService),
  createTopic: topicService.createTopic.bind(topicService),
  updateTopic: topicService.updateTopic.bind(topicService),
  deleteTopic: topicService.deleteTopic.bind(topicService),
  reorderTopics: topicService.reorderTopics.bind(topicService),

  getObjectivesByTopic: objectiveService.getObjectivesByTopic.bind(objectiveService),
  getObjectiveById: objectiveService.getObjectiveById.bind(objectiveService),
  createObjective: objectiveService.createObjective.bind(objectiveService),
  updateObjective: objectiveService.updateObjective.bind(objectiveService),
  deleteObjective: objectiveService.deleteObjective.bind(objectiveService),
  reorderObjectives: objectiveService.reorderObjectives.bind(objectiveService),

  reorder: treeService.reorder.bind(treeService),
  getStructureTree: treeService.getStructureTree.bind(treeService),
};
