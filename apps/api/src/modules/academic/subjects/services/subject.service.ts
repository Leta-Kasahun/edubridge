import { subjectRepository } from "../repository/subject.repository.js";
import {
  SubjectRecord,
  SubjectDetailRecord,
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectFilterParams,
} from "../types/subject.types.js";

export class SubjectService {
  async listSubjects(params: SubjectFilterParams): Promise<readonly SubjectRecord[]> {
    return subjectRepository.findMany(params);
  }

  async getSubjectById(id: string, tenantId?: string): Promise<SubjectDetailRecord> {
    const subject = await subjectRepository.findById(id, tenantId);
    if (!subject) {
      throw new Error("Subject not found");
    }
    return subject;
  }

  async createSubject(input: CreateSubjectInput, tenantId?: string): Promise<SubjectRecord> {
    const existing = await subjectRepository.findByCode(input.code);
    if (existing) {
      throw new Error(`Subject with code "${input.code.toUpperCase()}" already exists.`);
    }

    return subjectRepository.create(input, tenantId);
  }

  async updateSubject(id: string, input: UpdateSubjectInput, tenantId?: string): Promise<SubjectRecord> {
    const existing = await subjectRepository.findById(id, tenantId);
    if (!existing) {
      throw new Error("Subject not found");
    }

    if (input.isActive === false && existing.isActive) {
      const activeAssignments = await subjectRepository.countActiveAssignments(id, tenantId);
      if (activeAssignments > 0) {
        throw new Error(
          `Cannot deactivate "${existing.name}" because it currently has ${activeAssignments} active teacher assignment(s). Reassign or remove teachers first.`
        );
      }
    }

    return subjectRepository.update(id, input);
  }

  async toggleSubjectStatus(id: string, tenantId?: string): Promise<SubjectRecord> {
    const existing = await subjectRepository.findById(id, tenantId);
    if (!existing) {
      throw new Error("Subject not found");
    }

    const nextStatus = !existing.isActive;

    if (!nextStatus) {
      const activeAssignments = await subjectRepository.countActiveAssignments(id, tenantId);
      if (activeAssignments > 0) {
        throw new Error(
          `Cannot deactivate "${existing.name}" because it currently has ${activeAssignments} active teacher assignment(s). Reassign or remove teachers first.`
        );
      }
    }

    return subjectRepository.update(id, { isActive: nextStatus });
  }

  async assignGrades(
    subjectId: string,
    tenantId: string,
    gradeLevels: readonly number[]
  ): Promise<SubjectDetailRecord> {
    const subject = await subjectRepository.findById(subjectId, tenantId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    await subjectRepository.assignGrades(subjectId, tenantId, gradeLevels);
    return this.getSubjectById(subjectId, tenantId);
  }
}

export const subjectService = new SubjectService();
