import { teacherQualificationRepository } from "../repository/teacher-qualification.repository.js";
import {
  TeacherQualificationRecord,
  CreateTeacherQualificationInput,
  UpdateTeacherQualificationInput,
} from "../types/teacher-qualification.types.js";
import { NotFoundError, ForbiddenError } from "../../../shared/exceptions/index.js";

export class TeacherQualificationService {
  async getMyQualifications(
    userId: string,
    tenantId?: string
  ): Promise<TeacherQualificationRecord[]> {
    const teacher =
      await teacherQualificationRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      return [];
    }

    return teacherQualificationRepository.findByTeacherId(
      teacher.id,
      tenantId || teacher.tenantId
    );
  }

  async getQualificationsByTeacherId(
    tenantId: string,
    teacherId: string
  ): Promise<TeacherQualificationRecord[]> {
    return teacherQualificationRepository.findByTeacherId(teacherId, tenantId);
  }

  async getQualificationById(
    id: string,
    tenantId?: string
  ): Promise<TeacherQualificationRecord> {
    const qualification = await teacherQualificationRepository.findById(
      id,
      tenantId
    );
    if (!qualification) {
      throw new NotFoundError("Qualification not found");
    }
    return qualification;
  }

  async createQualification(
    userId: string,
    input: CreateTeacherQualificationInput,
    tenantId?: string
  ): Promise<TeacherQualificationRecord> {
    const teacher =
      await teacherQualificationRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    return teacherQualificationRepository.create(
      tenantId || teacher.tenantId,
      teacher.id,
      input
    );
  }

  async updateQualification(
    userId: string,
    id: string,
    input: UpdateTeacherQualificationInput,
    tenantId?: string
  ): Promise<TeacherQualificationRecord> {
    const teacher =
      await teacherQualificationRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    const existing = await teacherQualificationRepository.findById(
      id,
      tenantId || teacher.tenantId
    );
    if (!existing) {
      throw new NotFoundError("Qualification not found");
    }

    if (existing.teacherId !== teacher.id) {
      throw new ForbiddenError(
        "You do not have permission to update this qualification"
      );
    }

    return teacherQualificationRepository.update(
      id,
      input,
      tenantId || teacher.tenantId
    );
  }

  async deleteQualification(
    userId: string,
    id: string,
    tenantId?: string
  ): Promise<TeacherQualificationRecord> {
    const teacher =
      await teacherQualificationRepository.findTeacherProfileByUserId(
        userId,
        tenantId
      );
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found for current user");
    }

    const existing = await teacherQualificationRepository.findById(
      id,
      tenantId || teacher.tenantId
    );
    if (!existing) {
      throw new NotFoundError("Qualification not found");
    }

    if (existing.teacherId !== teacher.id) {
      throw new ForbiddenError(
        "You do not have permission to delete this qualification"
      );
    }

    return teacherQualificationRepository.delete(id);
  }
}

export const teacherQualificationService = new TeacherQualificationService();
