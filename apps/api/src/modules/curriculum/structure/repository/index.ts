export * from "./subject.repository.js";
export * from "./unit.repository.js";
export * from "./topic.repository.js";
export * from "./objective.repository.js";
export * from "./tree.repository.js";

import { subjectRepository } from "./subject.repository.js";
import { unitRepository } from "./unit.repository.js";
import { topicRepository } from "./topic.repository.js";
import { objectiveRepository } from "./objective.repository.js";
import { treeRepository } from "./tree.repository.js";

export const structureRepository = {
  findSubjectsByVersionId: subjectRepository.findSubjectsByVersionId.bind(subjectRepository),
  findSubjectById: subjectRepository.findSubjectById.bind(subjectRepository),
  createSubject: subjectRepository.createSubject.bind(subjectRepository),
  deleteSubject: subjectRepository.deleteSubject.bind(subjectRepository),
  getCurriculumSubjectContext: subjectRepository.getCurriculumSubjectContext.bind(subjectRepository),

  findUnitsBySubjectId: unitRepository.findUnitsBySubjectId.bind(unitRepository),
  findUnitById: unitRepository.findUnitById.bind(unitRepository),
  findNextUnitOrderIndex: unitRepository.findNextUnitOrderIndex.bind(unitRepository),
  createUnit: unitRepository.createUnit.bind(unitRepository),
  updateUnit: unitRepository.updateUnit.bind(unitRepository),
  deleteUnit: unitRepository.deleteUnit.bind(unitRepository),
  reorderUnits: unitRepository.reorderUnits.bind(unitRepository),
  getUnitContext: unitRepository.getUnitContext.bind(unitRepository),

  findTopicsByUnitId: topicRepository.findTopicsByUnitId.bind(topicRepository),
  findTopicById: topicRepository.findTopicById.bind(topicRepository),
  findNextTopicOrderIndex: topicRepository.findNextTopicOrderIndex.bind(topicRepository),
  createTopic: topicRepository.createTopic.bind(topicRepository),
  updateTopic: topicRepository.updateTopic.bind(topicRepository),
  deleteTopic: topicRepository.deleteTopic.bind(topicRepository),
  reorderTopics: topicRepository.reorderTopics.bind(topicRepository),
  getTopicContext: topicRepository.getTopicContext.bind(topicRepository),

  findObjectivesByTopicId: objectiveRepository.findObjectivesByTopicId.bind(objectiveRepository),
  findObjectiveById: objectiveRepository.findObjectiveById.bind(objectiveRepository),
  findNextObjectiveOrderIndex: objectiveRepository.findNextObjectiveOrderIndex.bind(objectiveRepository),
  createObjective: objectiveRepository.createObjective.bind(objectiveRepository),
  updateObjective: objectiveRepository.updateObjective.bind(objectiveRepository),
  deleteObjective: objectiveRepository.deleteObjective.bind(objectiveRepository),
  reorderObjectives: objectiveRepository.reorderObjectives.bind(objectiveRepository),
  getObjectiveContext: objectiveRepository.getObjectiveContext.bind(objectiveRepository),

  getStructureTree: treeRepository.getStructureTree.bind(treeRepository),
};
