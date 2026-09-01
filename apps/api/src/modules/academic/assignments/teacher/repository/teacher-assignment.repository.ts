import { prisma } from "../../../../../lib/prisma.js";
import { Prisma } from "../../../../../generated/prisma/client.js";
import {
  TeacherAssignmentListItem,
  SingleTeacherAssignmentInput,
  CreateTeacherAssignmentInput,
  TeacherLoadSummary,
  TeacherAssignmentFilterParams,
  PaginatedTeacherAssignmentsResult,
} from "../types/teacher-assignment.types.js";
import {
  TeacherAssignmentRoleType,
  TeacherAssignmentStatusType,
} from "../../../../../shared/constants/teacher-assignment.constants.js";

export class TeacherAssignmentRepository {
  async findAssignments(
    params: TeacherAssignmentFilterParams
  ): Promise<PaginatedTeacherAssignmentsResult> {
    const {
      tenantId,
      academicYearId,
      gradeId,
      sectionId,
      subjectId,
      teacherId,
      role,
      search,
      page = 1,
      limit = 20,
    } = params;

    const where: Prisma.TeacherAssignmentWhereInput = {
      tenantId,
      academicYearId,
      status: "ACTIVE",
    };

    if (sectionId) {
      where.sectionId = sectionId;
    } else if (gradeId) {
      where.section = { gradeId };
    }

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { teacher: { firstName: { contains: search, mode: "insensitive" } } },
        { teacher: { lastName: { contains: search, mode: "insensitive" } } },
        { teacher: { employeeCode: { contains: search, mode: "insensitive" } } },
        { section: { name: { contains: search, mode: "insensitive" } } },
        { subject: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, assignments] = await Promise.all([
      prisma.teacherAssignment.count({ where }),
      prisma.teacherAssignment.findMany({
        where,
        skip,
        take: limit,
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              employeeCode: true,
              email: true,
            },
          },
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
          section: {
            select: {
              id: true,
              name: true,
              grade: {
                select: {
                  id: true,
                  level: true,
                },
              },
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
        orderBy: [
          { teacher: { firstName: "asc" } },
          { section: { grade: { level: "asc" } } },
          { section: { name: "asc" } },
        ],
      }),
    ]);

    const teacherIds = [...new Set(assignments.map((a) => a.teacherId))];
    const loadCounts = await prisma.teacherAssignment.groupBy({
      by: ["teacherId"],
      where: {
        tenantId,
        academicYearId,
        teacherId: { in: teacherIds },
        status: "ACTIVE",
      },
      _count: {
        id: true,
      },
    });

    const loadMap = new Map<string, number>();
    for (const lc of loadCounts) {
      loadMap.set(lc.teacherId, lc._count.id);
    }

    const items = assignments.map((a) => {
      const teacherName = `${a.teacher.firstName} ${a.teacher.middleName || ""} ${a.teacher.lastName}`.trim();

      return {
        id: a.id,
        teacherId: a.teacher.id,
        teacherName,
        employeeCode: a.teacher.employeeCode,
        email: a.teacher.email,
        role: a.role as TeacherAssignmentRoleType,
        status: a.status as TeacherAssignmentStatusType,
        academicYearId: a.academicYear.id,
        academicYearName: a.academicYear.name,
        gradeId: a.section.grade.id,
        gradeLevel: a.section.grade.level,
        sectionId: a.section.id,
        sectionName: a.section.name,
        subjectId: a.subject?.id || null,
        subjectName: a.subject?.name || null,
        subjectCode: a.subject?.code || null,
        teacherActiveLoad: loadMap.get(a.teacher.id) || 1,
        startDate: a.startDate,
        endDate: a.endDate,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findActiveAssignment(
    tenantId: string,
    academicYearId: string,
    sectionId: string,
    subjectId: string | null | undefined,
    role: TeacherAssignmentRoleType
  ) {
    return prisma.teacherAssignment.findFirst({
      where: {
        tenantId,
        academicYearId,
        sectionId,
        subjectId: subjectId || null,
        role,
        status: "ACTIVE",
      },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findById(tenantId: string, id: string) {
    return prisma.teacherAssignment.findFirst({
      where: { id, tenantId },
      include: {
        teacher: true,
        section: {
          include: {
            grade: true,
          },
        },
        subject: true,
        academicYear: true,
      },
    });
  }

  async createAssignment(
    tenantId: string,
    input: SingleTeacherAssignmentInput,
    userId?: string
  ): Promise<TeacherAssignmentListItem> {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.teacherAssignment.create({
        data: {
          tenantId,
          teacherId: input.teacherId,
          academicYearId: input.academicYearId,
          sectionId: input.sectionId,
          subjectId: input.subjectId || null,
          role: input.role,
          status: "ACTIVE",
          startDate: new Date(),
        },
        include: {
          teacher: true,
          academicYear: true,
          section: {
            include: {
              grade: true,
            },
          },
          subject: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: "TEACHER_ASSIGNMENT_CREATED",
          resource: "TeacherAssignment",
          resourceId: assignment.id,
          metadata: {
            teacherId: input.teacherId,
            academicYearId: input.academicYearId,
            sectionId: input.sectionId,
            subjectId: input.subjectId,
            role: input.role,
          },
        },
      });

      const activeLoad = await tx.teacherAssignment.count({
        where: {
          tenantId,
          academicYearId: input.academicYearId,
          teacherId: input.teacherId,
          status: "ACTIVE",
        },
      });

      const teacherName = `${assignment.teacher.firstName} ${assignment.teacher.middleName || ""} ${assignment.teacher.lastName}`.trim();

      return {
        id: assignment.id,
        teacherId: assignment.teacher.id,
        teacherName,
        employeeCode: assignment.teacher.employeeCode,
        email: assignment.teacher.email,
        role: assignment.role as TeacherAssignmentRoleType,
        status: assignment.status as TeacherAssignmentStatusType,
        academicYearId: assignment.academicYear.id,
        academicYearName: assignment.academicYear.name,
        gradeId: assignment.section.grade.id,
        gradeLevel: assignment.section.grade.level,
        sectionId: assignment.section.id,
        sectionName: assignment.section.name,
        subjectId: assignment.subject?.id || null,
        subjectName: assignment.subject?.name || null,
        subjectCode: assignment.subject?.code || null,
        teacherActiveLoad: activeLoad,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
      };
    });
  }

  async reassignAssignment(
    tenantId: string,
    assignmentId: string,
    replacementTeacherId: string,
    reason: string,
    userId?: string
  ): Promise<TeacherAssignmentListItem> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.teacherAssignment.findFirst({
        where: { id: assignmentId, tenantId },
      });

      if (!existing) {
        throw new Error("Assignment not found");
      }

      await tx.teacherAssignment.update({
        where: { id: existing.id },
        data: {
          status: "INACTIVE",
          endDate: new Date(),
        },
      });

      const replacement = await tx.teacherAssignment.create({
        data: {
          tenantId,
          teacherId: replacementTeacherId,
          academicYearId: existing.academicYearId,
          sectionId: existing.sectionId,
          subjectId: existing.subjectId,
          role: existing.role,
          status: "ACTIVE",
          startDate: new Date(),
        },
        include: {
          teacher: true,
          academicYear: true,
          section: {
            include: {
              grade: true,
            },
          },
          subject: true,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: "TEACHER_ASSIGNMENT_REASSIGNED",
          resource: "TeacherAssignment",
          resourceId: replacement.id,
          metadata: {
            previousAssignmentId: existing.id,
            previousTeacherId: existing.teacherId,
            replacementTeacherId,
            reason,
          },
        },
      });

      const activeLoad = await tx.teacherAssignment.count({
        where: {
          tenantId,
          academicYearId: existing.academicYearId,
          teacherId: replacementTeacherId,
          status: "ACTIVE",
        },
      });

      const teacherName = `${replacement.teacher.firstName} ${replacement.teacher.middleName || ""} ${replacement.teacher.lastName}`.trim();

      return {
        id: replacement.id,
        teacherId: replacement.teacher.id,
        teacherName,
        employeeCode: replacement.teacher.employeeCode,
        email: replacement.teacher.email,
        role: replacement.role as TeacherAssignmentRoleType,
        status: replacement.status as TeacherAssignmentStatusType,
        academicYearId: replacement.academicYear.id,
        academicYearName: replacement.academicYear.name,
        gradeId: replacement.section.grade.id,
        gradeLevel: replacement.section.grade.level,
        sectionId: replacement.section.id,
        sectionName: replacement.section.name,
        subjectId: replacement.subject?.id || null,
        subjectName: replacement.subject?.name || null,
        subjectCode: replacement.subject?.code || null,
        teacherActiveLoad: activeLoad,
        startDate: replacement.startDate,
        endDate: replacement.endDate,
      };
    });
  }

  async endAssignment(
    tenantId: string,
    assignmentId: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.teacherAssignment.findFirst({
        where: { id: assignmentId, tenantId, status: "ACTIVE" },
      });

      if (!existing) {
        throw new Error("Active assignment not found");
      }

      await tx.teacherAssignment.update({
        where: { id: existing.id },
        data: {
          status: "INACTIVE",
          endDate: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: "TEACHER_ASSIGNMENT_ENDED",
          resource: "TeacherAssignment",
          resourceId: existing.id,
          metadata: {
            teacherId: existing.teacherId,
            sectionId: existing.sectionId,
            subjectId: existing.subjectId,
            reason,
          },
        },
      });
    });
  }

  async getTeacherLoadSummary(
    tenantId: string,
    teacherId: string,
    academicYearId: string
  ): Promise<TeacherLoadSummary | null> {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { id: teacherId, tenantId },
    });

    if (!teacher) return null;

    const result = await this.findAssignments({
      tenantId,
      academicYearId,
      teacherId,
      limit: 100,
    });
    const assignments = result.items;

    const homeroomCount = assignments.filter((a) => a.role === "HOMEROOM_TEACHER").length;
    const subjectAssignmentsCount = assignments.filter((a) => a.role === "SUBJECT_TEACHER").length;

    const teacherName = `${teacher.firstName} ${teacher.middleName || ""} ${teacher.lastName}`.trim();

    return {
      teacherId: teacher.id,
      teacherName,
      employeeCode: teacher.employeeCode,
      activeAssignmentsCount: assignments.length,
      homeroomCount,
      subjectAssignmentsCount,
      assignments,
    };
  }
}

export const teacherAssignmentRepository = new TeacherAssignmentRepository();
