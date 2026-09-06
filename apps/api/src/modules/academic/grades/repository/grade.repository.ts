import { prisma } from "../../../../lib/prisma.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import {
  GRADE_LEVEL_CATEGORY_MAP,
  GRADE_AVAILABLE_STREAMS_MAP,
} from "../../../../shared/constants/grade.constants.js";
import {
  GradeFilterParams,
  GradeRecord,
  GradeDetailRecord,
  CreateGradeInput,
} from "../types/grade.types.js";

export class GradeRepository {
  async findMany(params: GradeFilterParams): Promise<readonly GradeRecord[]> {
    const { tenantId, isActive, category, academicYearId, teacherId } = params;

    const conditions: Prisma.GradeWhereInput[] = [];
    if (tenantId) {
      conditions.push({ OR: [{ tenantId }, { tenantId: null }] });
    }
    if (isActive !== undefined) {
      conditions.push({ isActive });
    }
    if (category === "ELEMENTARY") {
      conditions.push({ level: { in: [7, 8] } });
    } else if (category === "HIGH_SCHOOL") {
      conditions.push({ level: { in: [9, 10, 11, 12] } });
    }
    if (teacherId) {
      conditions.push({
        sections: {
          some: {
            assignments: {
              some: {
                teacherId,
                status: "ACTIVE",
              },
            },
          },
        },
      });
    }

    const where: Prisma.GradeWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    let targetYearId = academicYearId;
    if (!targetYearId && tenantId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { tenantId, status: "ACTIVE" },
        select: { id: true },
      });
      if (activeYear) {
        targetYearId = activeYear.id;
      }
    }

    const grades = await prisma.grade.findMany({
      where,
      include: {
        sections: {
          where: {
            ...(tenantId ? { tenantId } : {}),
            ...(targetYearId ? { academicYearId: targetYearId } : {}),
            ...(teacherId ? { assignments: { some: { teacherId, status: "ACTIVE" } } } : {}),
          },
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
        _count: {
          select: {
            gradeSubjects: true,
          },
        },
      },
      orderBy: { level: "asc" },
    });

    const gradeMapByLevel = new Map<number, (typeof grades)[0]>();
    for (const g of grades) {
      const existing = gradeMapByLevel.get(g.level);
      if (!existing || (g.tenantId === tenantId && existing.tenantId !== tenantId)) {
        gradeMapByLevel.set(g.level, g);
      }
    }
    const resolvedGrades = Array.from(gradeMapByLevel.values()).sort((a, b) => a.level - b.level);

    return resolvedGrades.map((g) => {
      const totalStudents = g.sections.reduce(
        (sum, sec) => sum + sec._count.enrollments,
        0
      );

      return {
        id: g.id,
        tenantId: g.tenantId,
        level: g.level,
        category: GRADE_LEVEL_CATEGORY_MAP[g.level] || `Level ${g.level}`,
        availableStreams: GRADE_AVAILABLE_STREAMS_MAP[g.level] || ["NONE"],
        isActive: g.isActive,
        sectionCount: g.sections.length,
        studentCount: totalStudents,
        subjectCount: g._count.gradeSubjects,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      };
    });
  }

  async findById(
    tenantId: string,
    id: string,
    academicYearId?: string
  ): Promise<GradeDetailRecord | null> {
    let targetYearId = academicYearId;
    if (!targetYearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { tenantId, status: "ACTIVE" },
        select: { id: true },
      });
      if (activeYear) {
        targetYearId = activeYear.id;
      }
    }

    const g = await prisma.grade.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null }],
      },
      include: {
        sections: {
          where: {
            tenantId,
            ...(targetYearId ? { academicYearId: targetYearId } : {}),
          },
          include: {
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
        gradeSubjects: {
          include: {
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

    if (!g) return null;

    const totalStudents = g.sections.reduce(
      (sum, sec) => sum + sec._count.enrollments,
      0
    );

    return {
      id: g.id,
      tenantId: g.tenantId,
      level: g.level,
      category: GRADE_LEVEL_CATEGORY_MAP[g.level] || `Level ${g.level}`,
      availableStreams: GRADE_AVAILABLE_STREAMS_MAP[g.level] || ["NONE"],
      isActive: g.isActive,
      sectionCount: g.sections.length,
      studentCount: totalStudents,
      subjectCount: g.gradeSubjects.length,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      sections: g.sections.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        capacity: s.capacity,
        studentCount: s._count.enrollments,
      })),
      subjects: g.gradeSubjects.map((gs) => ({
        id: gs.subject.id,
        name: gs.subject.name,
        code: gs.subject.code,
      })),
    };
  }

  async findByLevel(
    tenantId: string,
    level: number
  ): Promise<GradeRecord | null> {
    const grades = await prisma.grade.findMany({
      where: {
        level,
        OR: [{ tenantId }, { tenantId: null }],
      },
      include: {
        sections: {
          where: { tenantId },
        },
        _count: {
          select: {
            gradeSubjects: true,
          },
        },
      },
    });

    if (grades.length === 0) return null;

    const g =
      grades.find((item) => item.tenantId === tenantId) ||
      grades.find((item) => item.tenantId === null) ||
      grades[0];

    if (!g) return null;

    return {
      id: g.id,
      tenantId: g.tenantId,
      level: g.level,
      category: GRADE_LEVEL_CATEGORY_MAP[g.level] || `Level ${g.level}`,
      availableStreams: GRADE_AVAILABLE_STREAMS_MAP[g.level] || ["NONE"],
      isActive: g.isActive,
      sectionCount: g.sections.length,
      studentCount: 0,
      subjectCount: g._count.gradeSubjects,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    };
  }

  async create(tenantId: string, input: CreateGradeInput): Promise<GradeRecord> {
    const created = await prisma.grade.create({
      data: {
        tenantId,
        level: input.level,
        isActive: input.isActive ?? true,
      },
      include: {
        sections: true,
        _count: {
          select: {
            gradeSubjects: true,
          },
        },
      },
    });

    return {
      id: created.id,
      tenantId: created.tenantId,
      level: created.level,
      category: GRADE_LEVEL_CATEGORY_MAP[created.level] || `Level ${created.level}`,
      availableStreams: GRADE_AVAILABLE_STREAMS_MAP[created.level] || ["NONE"],
      isActive: created.isActive,
      sectionCount: created.sections.length,
      studentCount: 0,
      subjectCount: created._count.gradeSubjects,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async toggleActive(tenantId: string, id: string): Promise<GradeRecord> {
    const grade = await prisma.grade.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null }],
      },
    });

    if (!grade) {
      throw new Error("Grade not found");
    }

    const updated = await prisma.grade.update({
      where: { id },
      data: { isActive: !grade.isActive },
      include: {
        sections: {
          where: { tenantId },
        },
        _count: {
          select: {
            gradeSubjects: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      tenantId: updated.tenantId,
      level: updated.level,
      category: GRADE_LEVEL_CATEGORY_MAP[updated.level] || `Level ${updated.level}`,
      availableStreams: GRADE_AVAILABLE_STREAMS_MAP[updated.level] || ["NONE"],
      isActive: updated.isActive,
      sectionCount: updated.sections.length,
      studentCount: 0,
      subjectCount: updated._count.gradeSubjects,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}

export const gradeRepository = new GradeRepository();
