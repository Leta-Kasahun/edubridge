import { prisma } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  SubjectRecord,
  SubjectDetailRecord,
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectFilterParams,
} from "../types/subject.types.js";

export class SubjectRepository {
  async findMany(params: SubjectFilterParams): Promise<readonly SubjectRecord[]> {
    const { tenantId, gradeLevel, isActive, search, teacherId } = params;

    const conditions: Prisma.SubjectWhereInput[] = [];
    if (isActive !== undefined) {
      conditions.push({ isActive });
    }

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { code: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (gradeLevel !== undefined && tenantId) {
      conditions.push({
        gradeSubjects: {
          some: {
            grade: {
              tenantId,
              level: gradeLevel,
            },
          },
        },
      });
    }

    if (teacherId) {
      conditions.push({
        assignments: {
          some: {
            teacherId,
            status: "ACTIVE",
            ...(tenantId ? { tenantId } : {}),
          },
        },
      });
    }

    const where: Prisma.SubjectWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        gradeSubjects: {
          where: tenantId
            ? {
                grade: {
                  tenantId,
                },
              }
            : undefined,
          include: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: {
              where: tenantId
                ? {
                    tenantId,
                    status: "ACTIVE",
                  }
                : undefined,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return subjects.map((sub) => {
      const assignedLevels = sub.gradeSubjects
        .map((gs) => gs.grade.level)
        .sort((a, b) => a - b);

      return {
        id: sub.id,
        code: sub.code,
        name: sub.name,
        description: sub.description,
        isActive: sub.isActive,
        assignedGradeLevels: assignedLevels,
        assignedGradeCount: assignedLevels.length,
        teacherAssignmentCount: sub._count.assignments,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    });
  }

  async findById(id: string, tenantId?: string): Promise<SubjectDetailRecord | null> {
    const sub = await prisma.subject.findUnique({
      where: { id },
      include: {
        gradeSubjects: {
          where: tenantId
            ? {
                grade: {
                  tenantId,
                },
              }
            : undefined,
          include: {
            grade: {
              select: {
                id: true,
                level: true,
              },
            },
          },
          orderBy: {
            grade: {
              level: "asc",
            },
          },
        },
        assignments: {
          where: tenantId
            ? {
                tenantId,
                status: "ACTIVE",
              }
            : {
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
            section: {
              select: {
                name: true,
                grade: {
                  select: {
                    level: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!sub) return null;

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      description: sub.description,
      isActive: sub.isActive,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      assignedGrades: sub.gradeSubjects.map((gs) => ({
        id: gs.id,
        gradeId: gs.grade.id,
        level: gs.grade.level,
      })),
      assignedTeachers: sub.assignments.map((a) => ({
        id: a.id,
        teacherId: a.teacher.id,
        fullName: `${a.teacher.firstName} ${a.teacher.middleName || ""} ${a.teacher.lastName}`.trim(),
        employeeCode: a.teacher.employeeCode,
        sectionName: a.section.name,
        gradeLevel: a.section.grade.level,
      })),
    };
  }

  async findByCode(code: string): Promise<SubjectRecord | null> {
    const sub = await prisma.subject.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: {
        gradeSubjects: {
          include: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!sub) return null;

    const assignedLevels = sub.gradeSubjects
      .map((gs) => gs.grade.level)
      .sort((a, b) => a - b);

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      description: sub.description,
      isActive: sub.isActive,
      assignedGradeLevels: assignedLevels,
      assignedGradeCount: assignedLevels.length,
      teacherAssignmentCount: sub._count.assignments,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  async findByName(name: string): Promise<SubjectRecord | null> {
    const sub = await prisma.subject.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
      include: {
        gradeSubjects: {
          include: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!sub) return null;

    const assignedLevels = sub.gradeSubjects
      .map((gs) => gs.grade.level)
      .sort((a, b) => a - b);

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      description: sub.description,
      isActive: sub.isActive,
      assignedGradeLevels: assignedLevels,
      assignedGradeCount: assignedLevels.length,
      teacherAssignmentCount: sub._count.assignments,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  async create(input: CreateSubjectInput, tenantId?: string): Promise<SubjectRecord> {
    const sub = await prisma.subject.create({
      data: {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        description: input.description?.trim() || null,
        isActive: true,
      },
    });

    if (tenantId && input.gradeLevels && input.gradeLevels.length > 0) {
      await this.assignGrades(sub.id, tenantId, input.gradeLevels);
    }

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      description: sub.description,
      isActive: sub.isActive,
      assignedGradeLevels: input.gradeLevels || [],
      assignedGradeCount: input.gradeLevels?.length || 0,
      teacherAssignmentCount: 0,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  async update(id: string, input: UpdateSubjectInput): Promise<SubjectRecord> {
    const data: Prisma.SubjectUpdateInput = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const sub = await prisma.subject.update({
      where: { id },
      data,
      include: {
        gradeSubjects: {
          include: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    const assignedLevels = sub.gradeSubjects
      .map((gs) => gs.grade.level)
      .sort((a, b) => a - b);

    return {
      id: sub.id,
      code: sub.code,
      name: sub.name,
      description: sub.description,
      isActive: sub.isActive,
      assignedGradeLevels: assignedLevels,
      assignedGradeCount: assignedLevels.length,
      teacherAssignmentCount: sub._count.assignments,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
    };
  }

  async assignGrades(
    subjectId: string,
    tenantId: string,
    gradeLevels: readonly number[]
  ): Promise<void> {
    const grades = await prisma.grade.findMany({
      where: {
        tenantId,
        level: { in: [...gradeLevels] },
      },
      select: {
        id: true,
        level: true,
      },
    });

    const targetGradeIds = grades.map((g) => g.id);

    await prisma.gradeSubject.deleteMany({
      where: {
        subjectId,
        grade: {
          tenantId,
        },
        gradeId: {
          notIn: targetGradeIds,
        },
      },
    });

    for (const grade of grades) {
      await prisma.gradeSubject.upsert({
        where: {
          gradeId_subjectId: {
            gradeId: grade.id,
            subjectId,
          },
        },
        create: {
          gradeId: grade.id,
          subjectId,
        },
        update: {},
      });
    }
  }

  async countActiveAssignments(subjectId: string, tenantId?: string): Promise<number> {
    return prisma.teacherAssignment.count({
      where: {
        subjectId,
        tenantId: tenantId || undefined,
        status: "ACTIVE",
      },
    });
  }
}

export const subjectRepository = new SubjectRepository();
