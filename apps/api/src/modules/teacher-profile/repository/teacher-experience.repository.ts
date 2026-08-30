import { prisma } from "../../../lib/prisma.js";
import {
  TeacherExperienceRecord,
  CreateTeacherExperienceInput,
  UpdateTeacherExperienceInput,
} from "../types/teacher-experience.types.js";

export class TeacherExperienceRepository {
  async findByTeacherId(
    teacherId: string,
    tenantId?: string
  ): Promise<TeacherExperienceRecord[]> {
    const whereClause: { teacherId: string; tenantId?: string } = { teacherId };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherExperience.findMany({
      where: whereClause,
      orderBy: [
        { startDate: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findById(
    id: string,
    tenantId?: string
  ): Promise<TeacherExperienceRecord | null> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherExperience.findFirst({
      where: whereClause,
    });
  }

  async create(
    tenantId: string,
    teacherId: string,
    data: CreateTeacherExperienceInput
  ): Promise<TeacherExperienceRecord> {
    return prisma.teacherExperience.create({
      data: {
        tenantId,
        teacherId,
        institution: data.institution,
        position: data.position || null,
        subjectId: data.subjectId || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async update(
    id: string,
    data: UpdateTeacherExperienceInput,
    tenantId?: string
  ): Promise<TeacherExperienceRecord> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherExperience.update({
      where: { id },
      data: {
        ...(data.institution !== undefined ? { institution: data.institution } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
        ...(data.subjectId !== undefined ? { subjectId: data.subjectId } : {}),
        ...(data.startDate !== undefined
          ? { startDate: new Date(data.startDate) }
          : {}),
        ...(data.endDate !== undefined
          ? { endDate: data.endDate ? new Date(data.endDate) : null }
          : {}),
      },
    });
  }

  async delete(id: string): Promise<TeacherExperienceRecord> {
    return prisma.teacherExperience.delete({
      where: {
        id,
      },
    });
  }

  async findTeacherProfileByUserId(userId: string, tenantId?: string) {
    const whereClause: { userId: string; tenantId?: string } = { userId };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherProfile.findFirst({
      where: whereClause,
    });
  }
}

export const teacherExperienceRepository =
  new TeacherExperienceRepository();
