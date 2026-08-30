import { prisma } from "../../../lib/prisma.js";
import {
  TeacherQualificationRecord,
  CreateTeacherQualificationInput,
  UpdateTeacherQualificationInput,
} from "../types/teacher-qualification.types.js";

export class TeacherQualificationRepository {
  async findByTeacherId(
    teacherId: string,
    tenantId?: string
  ): Promise<TeacherQualificationRecord[]> {
    const whereClause: { teacherId: string; tenantId?: string } = { teacherId };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherQualification.findMany({
      where: whereClause,
      orderBy: [
        { graduationYear: "desc" },
        { startYear: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findById(
    id: string,
    tenantId?: string
  ): Promise<TeacherQualificationRecord | null> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherQualification.findFirst({
      where: whereClause,
    });
  }

  async create(
    tenantId: string,
    teacherId: string,
    data: CreateTeacherQualificationInput
  ): Promise<TeacherQualificationRecord> {
    return prisma.teacherQualification.create({
      data: {
        tenantId,
        teacherId,
        level: data.level,
        fieldOfStudy: data.fieldOfStudy,
        institution: data.institution || null,
        startYear: data.startYear ?? null,
        graduationYear: data.graduationYear ?? null,
        documentUrl: data.documentUrl || null,
      },
    });
  }

  async update(
    id: string,
    data: UpdateTeacherQualificationInput,
    tenantId?: string
  ): Promise<TeacherQualificationRecord> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    return prisma.teacherQualification.update({
      where: { id },
      data: {
        ...(data.level !== undefined ? { level: data.level } : {}),
        ...(data.fieldOfStudy !== undefined
          ? { fieldOfStudy: data.fieldOfStudy }
          : {}),
        ...(data.institution !== undefined
          ? { institution: data.institution }
          : {}),
        ...(data.startYear !== undefined ? { startYear: data.startYear } : {}),
        ...(data.graduationYear !== undefined
          ? { graduationYear: data.graduationYear }
          : {}),
        ...(data.documentUrl !== undefined
          ? { documentUrl: data.documentUrl }
          : {}),
      },
    });
  }

  async delete(id: string): Promise<TeacherQualificationRecord> {
    return prisma.teacherQualification.delete({
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

export const teacherQualificationRepository =
  new TeacherQualificationRepository();
