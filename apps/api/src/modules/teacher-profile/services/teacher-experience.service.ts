import { teacherExperienceRepository } from "../repository/teacher-experience.repository.js";
import {
  TeacherExperienceRecord,
  CreateTeacherExperienceInput,
  UpdateTeacherExperienceInput,
} from "../types/teacher-experience.types.js";
import { NotFoundError, ForbiddenError } from "../../../shared/exceptions/index.js";

export class TeacherExperienceService {
  async getMyExperiences(
    userId: string,
    tenantId?: string
  ): Promise<TeacherExperienceRecord[]> {
    const teacher =
      await teacherExperienceRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      return [];
    }

    return teacherExperienceRepository.findByTeacherId(
      teacher.id,
      tenantId || teacher.tenantId
    );
  }

  async getExperiencesByTeacherId(
    tenantId: string,
    teacherId: string
  ): Promise<TeacherExperienceRecord[]> {
    return teacherExperienceRepository.findByTeacherId(teacherId, tenantId);
  }

  async getExperienceById(
    id: string,
    tenantId?: string
  ): Promise<TeacherExperienceRecord> {
    const experience = await teacherExperienceRepository.findById(
      id,
      tenantId
    );
    if (!experience) {
      throw new NotFoundError("Experience record not found");
    }
    return experience;
  }

  async createExperience(
    userId: string,
    input: CreateTeacherExperienceInput,
    tenantId?: string
  ): Promise<TeacherExperienceRecord> {
    const teacher =
      await teacherExperienceRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    return teacherExperienceRepository.create(
      tenantId || teacher.tenantId,
      teacher.id,
      input
    );
  }

  async updateExperience(
    userId: string,
    id: string,
    input: UpdateTeacherExperienceInput,
    tenantId?: string
  ): Promise<TeacherExperienceRecord> {
    const teacher =
      await teacherExperienceRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    const existing = await teacherExperienceRepository.findById(
      id,
      tenantId || teacher.tenantId
    );
    if (!existing) {
      throw new NotFoundError("Experience record not found");
    }

    if (existing.teacherId !== teacher.id) {
      throw new ForbiddenError(
        "You do not have permission to update this experience record"
      );
    }

    return teacherExperienceRepository.update(
      id,
      input,
      tenantId || teacher.tenantId
    );
  }

  async deleteExperience(
    userId: string,
    id: string,
    tenantId?: string
  ): Promise<TeacherExperienceRecord> {
    const teacher =
      await teacherExperienceRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    const existing = await teacherExperienceRepository.findById(
      id,
      tenantId || teacher.tenantId
    );
    if (!existing) {
      throw new NotFoundError("Experience record not found");
    }

    if (existing.teacherId !== teacher.id) {
      throw new ForbiddenError(
        "You do not have permission to delete this experience record"
      );
    }

    return teacherExperienceRepository.delete(id);
  }
}

export const teacherExperienceService = new TeacherExperienceService();
