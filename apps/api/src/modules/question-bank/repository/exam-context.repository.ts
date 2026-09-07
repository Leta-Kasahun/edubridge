import { prisma } from "../../../lib/prisma.js";
import {
  CreateExamContextInput,
  UpdateExamContextInput,
} from "../types/question-bank.types.js";
import {
  ExamScopeEnum,
  ExamContextStatusEnum,
} from "../../../shared/constants/question-bank.constants.js";

const isValidUuid = (val?: string | null): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export class ExamContextRepository {
  async create(tenantId: string, code: string, data: CreateExamContextInput) {
    return prisma.examContext.create({
      data: {
        tenantId,
        code,
        name: data.name,
        scope: data.scope,
        gradeId: data.gradeId && isValidUuid(data.gradeId) ? data.gradeId : null,
        subjectId: data.subjectId && isValidUuid(data.subjectId) ? data.subjectId : null,
        examYear: data.examYear,
        regionName: data.regionName,
        authorityName: data.authorityName,
        curriculumVersionId:
          data.curriculumVersionId && isValidUuid(data.curriculumVersionId)
            ? data.curriculumVersionId
            : null,
        status: "ACTIVE",
      },
      include: {
        grade: true,
        subject: true,
        curriculumVersion: true,
      },
    });
  }

  async findById(tenantId: string | null, id: string) {
    if (!isValidUuid(id)) return null;
    return prisma.examContext.findFirst({
      where: {
        id,
        ...(tenantId && isValidUuid(tenantId) && {
          OR: [{ tenantId }, { scope: "NATIONAL" }, { scope: "GENERAL" }],
        }),
      },
      include: {
        grade: true,
        subject: true,
        curriculumVersion: true,
        _count: {
          select: {
            questionBanks: true,
            assessments: true,
          },
        },
      },
    });
  }

  async findMany(
    tenantId: string | null,
    filters: {
      scope?: ExamScopeEnum;
      status?: ExamContextStatusEnum;
      gradeId?: string;
      subjectId?: string;
      examYear?: number;
      search?: string;
      page: number;
      limit: number;
    }
  ) {
    const where: Record<string, unknown> = {};

    if (tenantId && isValidUuid(tenantId)) {
      where.OR = [{ tenantId }, { scope: "NATIONAL" }, { scope: "GENERAL" }];
    }

    if (filters.scope) where.scope = filters.scope;
    if (filters.status) where.status = filters.status;
    if (filters.gradeId && isValidUuid(filters.gradeId)) where.gradeId = filters.gradeId;
    if (filters.subjectId && isValidUuid(filters.subjectId)) where.subjectId = filters.subjectId;
    if (filters.examYear) where.examYear = filters.examYear;

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      prisma.examContext.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include: {
          grade: true,
          subject: true,
          curriculumVersion: true,
        },
      }),
      prisma.examContext.count({ where }),
    ]);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async update(tenantId: string, id: string, data: UpdateExamContextInput) {
    return prisma.examContext.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.scope && { scope: data.scope }),
        ...(data.gradeId !== undefined && { gradeId: data.gradeId }),
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.examYear !== undefined && { examYear: data.examYear }),
        ...(data.regionName !== undefined && { regionName: data.regionName }),
        ...(data.authorityName !== undefined && {
          authorityName: data.authorityName,
        }),
        ...(data.curriculumVersionId !== undefined && {
          curriculumVersionId: data.curriculumVersionId,
        }),
        ...(data.status && { status: data.status }),
      },
      include: {
        grade: true,
        subject: true,
        curriculumVersion: true,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    return prisma.examContext.delete({
      where: { id },
    });
  }
}
