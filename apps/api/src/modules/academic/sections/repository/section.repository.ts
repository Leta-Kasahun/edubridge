import { prisma } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  SectionRecord,
  SectionDetailRecord,
  CreateSectionInput,
  UpdateSectionInput,
  SectionFilterParams,
  SectionHomeroomTeacher,
} from "../types/section.types.js";
import { SectionStatusType } from "../../../../shared/constants/section.constants.js";

export class SectionRepository {
  async findMany(params: SectionFilterParams): Promise<readonly SectionRecord[]> {
    const { tenantId, academicYearId, gradeId, status, search, teacherId } = params;

    const conditions: Prisma.SectionWhereInput[] = [];
    if (tenantId) conditions.push({ tenantId });
    if (academicYearId) conditions.push({ academicYearId });
    if (gradeId) conditions.push({ gradeId });
    if (status) conditions.push({ status });

    if (teacherId) {
      conditions.push({
        assignments: {
          some: {
            teacherId,
            status: "ACTIVE",
          },
        },
      });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.SectionWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const sections = await prisma.section.findMany({
      where,
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
        assignments: {
          where: {
            role: "HOMEROOM_TEACHER",
            status: "ACTIVE",
          },
          include: {
            teacher: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: [
        { grade: { level: "asc" } },
        { name: "asc" },
      ],
    });

    return sections.map((sec) => {
      const homeroomAssignment = sec.assignments[0];
      const homeroomTeacher: SectionHomeroomTeacher | null = homeroomAssignment
        ? {
            id: homeroomAssignment.id,
            teacherId: homeroomAssignment.teacher.id,
            fullName: `${homeroomAssignment.teacher.firstName} ${homeroomAssignment.teacher.middleName || ""} ${homeroomAssignment.teacher.lastName}`.trim(),
            employeeCode: homeroomAssignment.teacher.employeeCode,
          }
        : null;

      return {
        id: sec.id,
        tenantId: sec.tenantId,
        academicYearId: sec.academicYearId,
        academicYearName: sec.academicYear.name,
        academicYearCode: sec.academicYear.code,
        gradeId: sec.gradeId,
        gradeLevel: sec.grade.level,
        name: sec.name,
        code: sec.code,
        capacity: sec.capacity,
        status: sec.status as SectionStatusType,
        studentCount: sec._count.enrollments,
        homeroomTeacher,
        createdAt: sec.createdAt,
        updatedAt: sec.updatedAt,
      };
    });
  }

  async findById(
    tenantId: string,
    id: string
  ): Promise<SectionDetailRecord | null> {
    const sec = await prisma.section.findFirst({
      where: { id, tenantId },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
        enrollments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            student: {
              select: {
                id: true,
                studentCode: true,
                firstName: true,
                middleName: true,
                lastName: true,
                gender: true,
                status: true,
              },
            },
          },
          orderBy: {
            student: {
              firstName: "asc",
            },
          },
        },
        assignments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            teacher: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!sec) return null;

    const homeroomAssignment = sec.assignments.find(
      (a) => a.role === "HOMEROOM_TEACHER"
    );

    const homeroomTeacher: SectionHomeroomTeacher | null = homeroomAssignment
      ? {
          id: homeroomAssignment.id,
          teacherId: homeroomAssignment.teacher.id,
          fullName: `${homeroomAssignment.teacher.firstName} ${homeroomAssignment.teacher.middleName || ""} ${homeroomAssignment.teacher.lastName}`.trim(),
          employeeCode: homeroomAssignment.teacher.employeeCode,
        }
      : null;

    return {
      id: sec.id,
      tenantId: sec.tenantId,
      academicYearId: sec.academicYearId,
      academicYearName: sec.academicYear.name,
      academicYearCode: sec.academicYear.code,
      gradeId: sec.gradeId,
      gradeLevel: sec.grade.level,
      name: sec.name,
      code: sec.code,
      capacity: sec.capacity,
      status: sec.status as SectionStatusType,
      studentCount: sec._count.enrollments,
      homeroomTeacher,
      createdAt: sec.createdAt,
      updatedAt: sec.updatedAt,
      enrolledStudents: sec.enrollments.map((e) => ({
        id: e.id,
        studentId: e.student.id,
        studentCode: e.student.studentCode,
        fullName: `${e.student.firstName} ${e.student.middleName || ""} ${e.student.lastName || ""}`.trim(),
        gender: e.student.gender,
        status: e.student.status,
        enrolledAt: e.enrolledAt,
      })),
      assignedTeachers: sec.assignments.map((a) => ({
        id: a.id,
        teacherId: a.teacher.id,
        fullName: `${a.teacher.firstName} ${a.teacher.middleName || ""} ${a.teacher.lastName}`.trim(),
        employeeCode: a.teacher.employeeCode,
        role: a.role,
        subjectId: a.subject?.id || null,
        subjectName: a.subject?.name || null,
        subjectCode: a.subject?.code || null,
      })),
    };
  }

  async findByNameAndGrade(
    tenantId: string,
    academicYearId: string,
    gradeId: string,
    name: string
  ): Promise<SectionRecord | null> {
    const sec = await prisma.section.findFirst({
      where: {
        tenantId,
        academicYearId,
        gradeId,
        name: { equals: name.trim(), mode: "insensitive" },
      },
      include: {
        academicYear: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, level: true } },
        _count: { select: { enrollments: true } },
        assignments: {
          where: { role: "HOMEROOM_TEACHER", status: "ACTIVE" },
          include: {
            teacher: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!sec) return null;

    const homeroomAssignment = sec.assignments[0];
    const homeroomTeacher: SectionHomeroomTeacher | null = homeroomAssignment
      ? {
          id: homeroomAssignment.id,
          teacherId: homeroomAssignment.teacher.id,
          fullName: `${homeroomAssignment.teacher.firstName} ${homeroomAssignment.teacher.middleName || ""} ${homeroomAssignment.teacher.lastName}`.trim(),
          employeeCode: homeroomAssignment.teacher.employeeCode,
        }
      : null;

    return {
      id: sec.id,
      tenantId: sec.tenantId,
      academicYearId: sec.academicYearId,
      academicYearName: sec.academicYear.name,
      academicYearCode: sec.academicYear.code,
      gradeId: sec.gradeId,
      gradeLevel: sec.grade.level,
      name: sec.name,
      code: sec.code,
      capacity: sec.capacity,
      status: sec.status as SectionStatusType,
      studentCount: sec._count.enrollments,
      homeroomTeacher,
      createdAt: sec.createdAt,
      updatedAt: sec.updatedAt,
    };
  }

  async findByCode(
    tenantId: string,
    academicYearId: string,
    code: string
  ): Promise<SectionRecord | null> {
    const sec = await prisma.section.findFirst({
      where: {
        tenantId,
        academicYearId,
        code: { equals: code.trim(), mode: "insensitive" },
      },
      include: {
        academicYear: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, level: true } },
        _count: { select: { enrollments: true } },
        assignments: {
          where: { role: "HOMEROOM_TEACHER", status: "ACTIVE" },
          include: {
            teacher: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!sec) return null;

    const homeroomAssignment = sec.assignments[0];
    const homeroomTeacher: SectionHomeroomTeacher | null = homeroomAssignment
      ? {
          id: homeroomAssignment.id,
          teacherId: homeroomAssignment.teacher.id,
          fullName: `${homeroomAssignment.teacher.firstName} ${homeroomAssignment.teacher.middleName || ""} ${homeroomAssignment.teacher.lastName}`.trim(),
          employeeCode: homeroomAssignment.teacher.employeeCode,
        }
      : null;

    return {
      id: sec.id,
      tenantId: sec.tenantId,
      academicYearId: sec.academicYearId,
      academicYearName: sec.academicYear.name,
      academicYearCode: sec.academicYear.code,
      gradeId: sec.gradeId,
      gradeLevel: sec.grade.level,
      name: sec.name,
      code: sec.code,
      capacity: sec.capacity,
      status: sec.status as SectionStatusType,
      studentCount: sec._count.enrollments,
      homeroomTeacher,
      createdAt: sec.createdAt,
      updatedAt: sec.updatedAt,
    };
  }

  async countActiveStudents(tenantId: string, sectionId: string): Promise<number> {
    return prisma.studentEnrollment.count({
      where: {
        tenantId,
        sectionId,
        status: "ACTIVE",
      },
    });
  }

  async create(tenantId: string, input: CreateSectionInput & { code: string }): Promise<SectionRecord> {
    const created = await prisma.section.create({
      data: {
        tenantId,
        academicYearId: input.academicYearId,
        gradeId: input.gradeId,
        name: input.name,
        code: input.code,
        capacity: input.capacity,
        status: "ACTIVE",
      },
      include: {
        academicYear: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, level: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (input.homeroomTeacherId) {
      await this.setHomeroomTeacher(
        tenantId,
        created.id,
        created.academicYearId,
        input.homeroomTeacherId
      );
    }

    const homeroomTeacher = input.homeroomTeacherId
      ? await this.getHomeroomTeacher(tenantId, created.id)
      : null;

    return {
      id: created.id,
      tenantId: created.tenantId,
      academicYearId: created.academicYearId,
      academicYearName: created.academicYear.name,
      academicYearCode: created.academicYear.code,
      gradeId: created.gradeId,
      gradeLevel: created.grade.level,
      name: created.name,
      code: created.code,
      capacity: created.capacity,
      status: created.status as SectionStatusType,
      studentCount: 0,
      homeroomTeacher,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async createMany(
    tenantId: string,
    sections: readonly {
      academicYearId: string;
      gradeId: string;
      name: string;
      code: string;
      capacity?: number | null;
    }[]
  ): Promise<number> {
    const result = await prisma.section.createMany({
      data: sections.map((sec) => ({
        tenantId,
        academicYearId: sec.academicYearId,
        gradeId: sec.gradeId,
        name: sec.name,
        code: sec.code,
        capacity: sec.capacity,
        status: "ACTIVE",
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateSectionInput
  ): Promise<SectionRecord> {
    const data: Prisma.SectionUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.status !== undefined) data.status = input.status;

    const updated = await prisma.section.update({
      where: { id },
      data,
      include: {
        academicYear: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, level: true } },
        _count: {
          select: {
            enrollments: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (input.homeroomTeacherId !== undefined) {
      await this.setHomeroomTeacher(
        tenantId,
        updated.id,
        updated.academicYearId,
        input.homeroomTeacherId
      );
    }

    const homeroomTeacher = await this.getHomeroomTeacher(tenantId, updated.id);

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      academicYearId: updated.academicYearId,
      academicYearName: updated.academicYear.name,
      academicYearCode: updated.academicYear.code,
      gradeId: updated.gradeId,
      gradeLevel: updated.grade.level,
      name: updated.name,
      code: updated.code,
      capacity: updated.capacity,
      status: updated.status as SectionStatusType,
      studentCount: updated._count.enrollments,
      homeroomTeacher,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: SectionStatusType
  ): Promise<SectionRecord> {
    const updated = await prisma.section.update({
      where: { id },
      data: { status },
      include: {
        academicYear: { select: { id: true, name: true, code: true } },
        grade: { select: { id: true, level: true } },
        _count: {
          select: {
            enrollments: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    const homeroomTeacher = await this.getHomeroomTeacher(tenantId, updated.id);

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      academicYearId: updated.academicYearId,
      academicYearName: updated.academicYear.name,
      academicYearCode: updated.academicYear.code,
      gradeId: updated.gradeId,
      gradeLevel: updated.grade.level,
      name: updated.name,
      code: updated.code,
      capacity: updated.capacity,
      status: updated.status as SectionStatusType,
      studentCount: updated._count.enrollments,
      homeroomTeacher,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await prisma.section.deleteMany({
      where: { id, tenantId },
    });
  }

  private async setHomeroomTeacher(
    tenantId: string,
    sectionId: string,
    academicYearId: string,
    teacherId: string | null
  ): Promise<void> {
    await prisma.teacherAssignment.updateMany({
      where: {
        tenantId,
        sectionId,
        role: "HOMEROOM_TEACHER",
      },
      data: {
        status: "INACTIVE",
        endDate: new Date(),
      },
    });

    if (teacherId) {
      await prisma.teacherAssignment.create({
        data: {
          tenantId,
          sectionId,
          academicYearId,
          teacherId,
          role: "HOMEROOM_TEACHER",
          status: "ACTIVE",
          startDate: new Date(),
        },
      });
    }
  }

  private async getHomeroomTeacher(
    tenantId: string,
    sectionId: string
  ): Promise<SectionHomeroomTeacher | null> {
    const assignment = await prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        sectionId,
        role: "HOMEROOM_TEACHER",
        status: "ACTIVE",
      },
      include: {
        teacher: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      },
    });

    if (!assignment) return null;

    return {
      id: assignment.id,
      teacherId: assignment.teacher.id,
      fullName: `${assignment.teacher.firstName} ${assignment.teacher.middleName || ""} ${assignment.teacher.lastName}`.trim(),
      employeeCode: assignment.teacher.employeeCode,
    };
  }
}

export const sectionRepository = new SectionRepository();
