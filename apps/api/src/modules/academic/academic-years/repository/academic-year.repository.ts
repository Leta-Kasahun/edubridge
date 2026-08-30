import { prisma } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { DEFAULT_ACADEMIC_YEAR_PAGE_LIMIT } from "../../../../shared/constants/academic.constants.js";
import {
  AcademicYearFilterParams,
  AcademicYearRecord,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  PaginatedAcademicYearsResult,
} from "../types/academic-year.types.js";

export class AcademicYearRepository {
  async findMany(
    params: AcademicYearFilterParams
  ): Promise<PaginatedAcademicYearsResult> {
    const {
      tenantId,
      search,
      status,
      page = 1,
      limit = DEFAULT_ACADEMIC_YEAR_PAGE_LIMIT,
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.AcademicYearWhereInput = {};
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { code: { contains: s, mode: "insensitive" } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.academicYear.count({ where }),
      prisma.academicYear.findMany({
        where,
        include: {
          _count: {
            select: {
              sections: true,
              enrollments: true,
              assignments: true,
            },
          },
        },
        orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    const data: AcademicYearRecord[] = records.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      code: r.code,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      sectionCount: r._count.sections,
      studentEnrollmentCount: r._count.enrollments,
      teacherAssignmentCount: r._count.assignments,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findById(
    tenantId: string,
    id: string
  ): Promise<AcademicYearRecord | null> {
    const r = await prisma.academicYear.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      code: r.code,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      sectionCount: r._count.sections,
      studentEnrollmentCount: r._count.enrollments,
      teacherAssignmentCount: r._count.assignments,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async findByCode(
    tenantId: string,
    code: string
  ): Promise<AcademicYearRecord | null> {
    const r = await prisma.academicYear.findFirst({
      where: {
        tenantId,
        code: { equals: code.trim(), mode: "insensitive" },
      },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      code: r.code,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      sectionCount: r._count.sections,
      studentEnrollmentCount: r._count.enrollments,
      teacherAssignmentCount: r._count.assignments,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async findActive(tenantId: string): Promise<AcademicYearRecord | null> {
    const r = await prisma.academicYear.findFirst({
      where: { tenantId, status: "ACTIVE" },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    if (!r) return null;

    return {
      id: r.id,
      tenantId: r.tenantId,
      name: r.name,
      code: r.code,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      sectionCount: r._count.sections,
      studentEnrollmentCount: r._count.enrollments,
      teacherAssignmentCount: r._count.assignments,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async create(
    tenantId: string,
    data: CreateAcademicYearInput
  ): Promise<AcademicYearRecord> {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (data.status === "ACTIVE") {
      return prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({
          where: { tenantId, status: "ACTIVE" },
          data: { status: "COMPLETED" },
        });

        const created = await tx.academicYear.create({
          data: {
            tenantId,
            name: data.name.trim(),
            code: data.code.trim().toUpperCase(),
            startDate: start,
            endDate: end,
            status: "ACTIVE",
          },
          include: {
            _count: {
              select: {
                sections: true,
                enrollments: true,
                assignments: true,
              },
            },
          },
        });

        return {
          id: created.id,
          tenantId: created.tenantId,
          name: created.name,
          code: created.code,
          startDate: created.startDate,
          endDate: created.endDate,
          status: created.status,
          sectionCount: created._count.sections,
          studentEnrollmentCount: created._count.enrollments,
          teacherAssignmentCount: created._count.assignments,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
      });
    }

    const created = await prisma.academicYear.create({
      data: {
        tenantId,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        startDate: start,
        endDate: end,
        status: data.status || "UPCOMING",
      },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return {
      id: created.id,
      tenantId: created.tenantId,
      name: created.name,
      code: created.code,
      startDate: created.startDate,
      endDate: created.endDate,
      status: created.status,
      sectionCount: created._count.sections,
      studentEnrollmentCount: created._count.enrollments,
      teacherAssignmentCount: created._count.assignments,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async update(
    tenantId: string,
    id: string,
    data: UpdateAcademicYearInput
  ): Promise<AcademicYearRecord> {
    const updateData: Prisma.AcademicYearUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase();
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);

    if (data.status === "ACTIVE") {
      return prisma.$transaction(async (tx) => {
        await tx.academicYear.updateMany({
          where: { tenantId, status: "ACTIVE", id: { not: id } },
          data: { status: "COMPLETED" },
        });

        const updated = await tx.academicYear.update({
          where: { id },
          data: {
            ...updateData,
            status: "ACTIVE",
          },
          include: {
            _count: {
              select: {
                sections: true,
                enrollments: true,
                assignments: true,
              },
            },
          },
        });

        return {
          id: updated.id,
          tenantId: updated.tenantId,
          name: updated.name,
          code: updated.code,
          startDate: updated.startDate,
          endDate: updated.endDate,
          status: updated.status,
          sectionCount: updated._count.sections,
          studentEnrollmentCount: updated._count.enrollments,
          teacherAssignmentCount: updated._count.assignments,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      });
    }

    if (data.status !== undefined) updateData.status = data.status;

    const updated = await prisma.academicYear.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      name: updated.name,
      code: updated.code,
      startDate: updated.startDate,
      endDate: updated.endDate,
      status: updated.status,
      sectionCount: updated._count.sections,
      studentEnrollmentCount: updated._count.enrollments,
      teacherAssignmentCount: updated._count.assignments,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async setActive(tenantId: string, id: string): Promise<AcademicYearRecord> {
    return prisma.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: { tenantId, status: "ACTIVE", id: { not: id } },
        data: { status: "COMPLETED" },
      });

      const updated = await tx.academicYear.update({
        where: { id },
        data: { status: "ACTIVE" },
        include: {
          _count: {
            select: {
              sections: true,
              enrollments: true,
              assignments: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        tenantId: updated.tenantId,
        name: updated.name,
        code: updated.code,
        startDate: updated.startDate,
        endDate: updated.endDate,
        status: updated.status,
        sectionCount: updated._count.sections,
        studentEnrollmentCount: updated._count.enrollments,
        teacherAssignmentCount: updated._count.assignments,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    });
  }

  async archive(tenantId: string, id: string): Promise<AcademicYearRecord> {
    const updated = await prisma.academicYear.update({
      where: { id, tenantId },
      data: { status: "ARCHIVED" },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      name: updated.name,
      code: updated.code,
      startDate: updated.startDate,
      endDate: updated.endDate,
      status: updated.status,
      sectionCount: updated._count.sections,
      studentEnrollmentCount: updated._count.enrollments,
      teacherAssignmentCount: updated._count.assignments,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async restore(tenantId: string, id: string): Promise<AcademicYearRecord> {
    const updated = await prisma.academicYear.update({
      where: { id, tenantId },
      data: { status: "COMPLETED" },
      include: {
        _count: {
          select: {
            sections: true,
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      name: updated.name,
      code: updated.code,
      startDate: updated.startDate,
      endDate: updated.endDate,
      status: updated.status,
      sectionCount: updated._count.sections,
      studentEnrollmentCount: updated._count.enrollments,
      teacherAssignmentCount: updated._count.assignments,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

export const academicYearRepository = new AcademicYearRepository();
