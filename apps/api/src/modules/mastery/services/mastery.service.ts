import { MasteryRepository } from "../repository/mastery.repository.js";
import {
  SectionMasteryMatrixResponse,
  SingleStudentMasteryResponse,
  TopicMasteryHistoryItem,
} from "../types/mastery.types.js";

export class MasteryService {
  constructor(
    private readonly masteryRepo: MasteryRepository = new MasteryRepository()
  ) {}

  async getSectionMasteryMatrix(
    tenantId: string,
    sectionId: string,
    subjectId?: string
  ): Promise<SectionMasteryMatrixResponse> {
    return this.masteryRepo.getSectionMasteryMatrix(
      tenantId,
      sectionId,
      subjectId
    );
  }

  async getStudentMastery(
    tenantId: string,
    studentId: string,
    subjectId?: string
  ): Promise<SingleStudentMasteryResponse> {
    return this.masteryRepo.getStudentMastery(tenantId, studentId, subjectId);
  }

  async getTopicMasteryHistory(
    tenantId: string,
    studentId: string,
    topicId: string
  ): Promise<TopicMasteryHistoryItem[]> {
    return this.masteryRepo.getTopicMasteryHistory(
      tenantId,
      studentId,
      topicId
    );
  }

  async recordEvidenceForAttempt(
    attemptId: string,
    tenantId: string
  ): Promise<void> {
    return this.masteryRepo.recordEvidenceForAttempt(attemptId, tenantId);
  }
}
