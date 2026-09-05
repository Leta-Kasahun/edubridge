import { prisma } from "../../../../../lib/prisma.js";
import { Prisma } from "../../../../../generated/prisma/client.js";
import {
  StudentRosterItem,
  StudentEnrollmentHistoryItem,
  SectionCapacityInfo,
  PromotionPreviewRow,
  PromotionPreviewResult,
  CommitPromotionInput,
  RosterFilterParams,
  PaginatedRosterResult,
} from "../types/student-assignment.types.js";
import { StudentEnrollmentStatusType } from "../../../../../shared/constants/student-assignment.constants.js";

export class StudentAssignmentRepository {
  async findRoster(params: RosterFilterParams): Promise<PaginatedRosterResult> {
    const { tenantId, academicYearId, gradeId, sectionId, search, page = 1, limit = 20, teacherId } = params;

    const where: Prisma.StudentEnrollmentWhereInput = {
      tenantId,
      academicYearId,
    };

    if (sectionId) {
      where.sectionId = sectionId;
    } else if (gradeId) {
      where.section = {
        gradeId,
      };
    }

    if (teacherId) {
      where.section = {
        ...(where.section && typeof where.section === "object" ? where.section : {}),
        assignments: {
          some: {
            teacherId,
            status: "ACTIVE",
          },
        },
      };
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { middleName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { studentCode: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const [total, enrollments] = await Promise.all([
      prisma.studentEnrollment.count({ where }),
      prisma.studentEnrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              studentCode: true,
              firstName: true,
              middleName: true,
              lastName: true,
              gender: true,
              user: {
                select: { username: true },
              },
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
        },
        orderBy: [
          { section: { grade: { level: "asc" } } },
          { section: { name: "asc" } },
          { student: { firstName: "asc" } },
        ],
      }),
    ]);

    const items = enrollments.map((e) => ({
      enrollmentId: e.id,
      studentId: e.student.id,
      studentCode: e.student.studentCode,
      fullName: `${e.student.firstName} ${e.student.middleName || ""} ${e.student.lastName}`.trim(),
      username: e.student.user?.username ?? null,
      gender: e.student.gender as "MALE" | "FEMALE",
      academicYearId: e.academicYear.id,
      academicYearName: e.academicYear.name,
      gradeId: e.section.grade.id,
      gradeLevel: e.section.grade.level,
      sectionId: e.section.id,
      sectionName: e.section.name,
      status: e.status as StudentEnrollmentStatusType,
      enrolledAt: e.enrolledAt,
    }));

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

  async getSectionCapacityInfo(
    tenantId: string,
    sectionId: string
  ): Promise<SectionCapacityInfo | null> {
    const sec = await prisma.section.findFirst({
      where: { id: sectionId, tenantId },
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
    });

    if (!sec) return null;

    const activeCount = sec._count.enrollments;
    const availableSeats = sec.capacity !== null ? Math.max(0, sec.capacity - activeCount) : null;

    return {
      sectionId: sec.id,
      sectionName: sec.name,
      gradeId: sec.grade.id,
      gradeLevel: sec.grade.level,
      capacity: sec.capacity,
      activeCount,
      availableSeats,
    };
  }

  async getAvailableSectionsForGrade(
    tenantId: string,
    academicYearId: string,
    gradeLevel: number
  ): Promise<readonly SectionCapacityInfo[]> {
    let sections = await prisma.section.findMany({
      where: {
        tenantId,
        academicYearId,
        grade: { level: gradeLevel },
        status: "ACTIVE",
      },
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    if (sections.length === 0) {
      sections = await prisma.section.findMany({
        where: {
          tenantId,
          grade: { level: gradeLevel },
          status: "ACTIVE",
        },
        include: {
          grade: {
            select: {
              id: true,
              level: true,
            },
          },
          _count: {
            select: {
              enrollments: {
                where: { status: "ACTIVE" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    return sections.map((sec) => {
      const activeCount = sec._count.enrollments;
      const availableSeats = sec.capacity !== null ? Math.max(0, sec.capacity - activeCount) : null;

      return {
        sectionId: sec.id,
        sectionName: sec.name,
        gradeId: sec.grade.id,
        gradeLevel: sec.grade.level,
        capacity: sec.capacity,
        activeCount,
        availableSeats,
      };
    });
  }

  async getStudentCurrentEnrollment(
    tenantId: string,
    studentId: string,
    academicYearId: string
  ) {
    return prisma.studentEnrollment.findFirst({
      where: {
        tenantId,
        studentId,
        academicYearId,
        status: "ACTIVE",
      },
      include: {
        section: {
          include: {
            grade: true,
          },
        },
      },
    });
  }

  async transferSingle(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    targetSectionId: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.studentEnrollment.findFirst({
        where: { tenantId, studentId, academicYearId, status: "ACTIVE" },
      });

      if (!enrollment) {
        throw new Error("Active enrollment record not found for student in this academic year.");
      }

      const previousSectionId = enrollment.sectionId;

      await tx.studentEnrollment.update({
        where: { id: enrollment.id },
        data: {
          sectionId: targetSectionId,
          updatedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: "STUDENT_SECTION_TRANSFER",
          resource: "StudentEnrollment",
          resourceId: enrollment.id,
          metadata: {
            studentId,
            academicYearId,
            previousSectionId,
            targetSectionId,
            reason,
          },
        },
      });
    });
  }

  async transferBulk(
    tenantId: string,
    studentIds: readonly string[],
    academicYearId: string,
    targetSectionId: string,
    reason: string,
    userId?: string
  ): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const enrollments = await tx.studentEnrollment.findMany({
        where: {
          tenantId,
          academicYearId,
          studentId: { in: [...studentIds] },
          status: "ACTIVE",
        },
      });

      if (enrollments.length !== studentIds.length) {
        throw new Error("One or more selected students do not have active enrollments in this session.");
      }

      for (const e of enrollments) {
        const previousSectionId = e.sectionId;

        await tx.studentEnrollment.update({
          where: { id: e.id },
          data: {
            sectionId: targetSectionId,
            updatedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            userId: userId || null,
            action: "STUDENT_BULK_SECTION_TRANSFER",
            resource: "StudentEnrollment",
            resourceId: e.id,
            metadata: {
              studentId: e.studentId,
              academicYearId,
              previousSectionId,
              targetSectionId,
              reason,
            },
          },
        });
      }

      return enrollments.length;
    });
  }

  async getPromotionPreview(
    tenantId: string,
    sourceAcademicYearId: string,
    targetAcademicYearId: string,
    gradeLevel: number
  ): Promise<PromotionPreviewResult> {
    const targetGradeLevel = Math.min(12, gradeLevel + 1);

    const sourceEnrollments = await prisma.studentEnrollment.findMany({
      where: {
        tenantId,
        academicYearId: sourceAcademicYearId,
        status: "ACTIVE",
        section: {
          grade: {
            level: gradeLevel,
          },
        },
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
          },
        },
        section: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { section: { name: "asc" } },
        { student: { firstName: "asc" } },
      ],
    });

    const targetGrade = await prisma.grade.findFirst({
      where: { tenantId, level: targetGradeLevel, isActive: true },
    });

    const targetSections = await this.getAvailableSectionsForGrade(
      tenantId,
      targetAcademicYearId,
      targetGradeLevel
    );

    const sameGradeSections = await this.getAvailableSectionsForGrade(
      tenantId,
      targetAcademicYearId,
      gradeLevel
    );

    const students: PromotionPreviewRow[] = sourceEnrollments.map((e) => {
      const matchingSection = targetSections.find(
        (ts) => ts.sectionName.toLowerCase() === e.section.name.toLowerCase()
      ) || targetSections[0] || null;

      return {
        studentId: e.student.id,
        studentCode: e.student.studentCode,
        fullName: `${e.student.firstName} ${e.student.middleName || ""} ${e.student.lastName}`.trim(),
        gender: e.student.gender as "MALE" | "FEMALE",
        currentGradeLevel: gradeLevel,
        currentSectionId: e.section.id,
        currentSectionName: e.section.name,
        proposedGradeId: targetGrade?.id || null,
        proposedGradeLevel: targetGradeLevel,
        proposedSectionId: matchingSection?.sectionId || null,
        proposedSectionName: matchingSection?.sectionName || null,
        isPromoted: true,
      };
    });

    return {
      sourceAcademicYearId,
      targetAcademicYearId,
      gradeLevel,
      targetGradeLevel,
      students,
      targetSections: [...targetSections, ...sameGradeSections],
    };
  }

  async commitPromotion(
    tenantId: string,
    input: CommitPromotionInput,
    userId?: string
  ): Promise<number> {
    const { sourceAcademicYearId, targetAcademicYearId, items } = input;

    return prisma.$transaction(async (tx) => {
      let count = 0;

      for (const item of items) {
        await tx.studentEnrollment.updateMany({
          where: {
            tenantId,
            studentId: item.studentId,
            academicYearId: sourceAcademicYearId,
            status: "ACTIVE",
          },
          data: {
            status: "COMPLETED",
            endedAt: new Date(),
          },
        });

        const newEnrollment = await tx.studentEnrollment.upsert({
          where: {
            studentId_academicYearId: {
              studentId: item.studentId,
              academicYearId: targetAcademicYearId,
            },
          },
          update: {
            sectionId: item.targetSectionId,
            status: "ACTIVE",
            enrolledAt: new Date(),
            endedAt: null,
          },
          create: {
            tenantId,
            studentId: item.studentId,
            academicYearId: targetAcademicYearId,
            sectionId: item.targetSectionId,
            status: "ACTIVE",
            enrolledAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            tenantId,
            userId: userId || null,
            action: item.isPromoted ? "STUDENT_GRADE_PROMOTION" : "STUDENT_GRADE_RETAINED",
            resource: "StudentEnrollment",
            resourceId: newEnrollment.id,
            metadata: {
              studentId: item.studentId,
              sourceAcademicYearId,
              targetAcademicYearId,
              targetSectionId: item.targetSectionId,
              isPromoted: item.isPromoted,
            },
          },
        });

        count++;
      }

      return count;
    });
  }

  async withdrawStudent(
    tenantId: string,
    studentId: string,
    academicYearId: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.studentEnrollment.findFirst({
        where: { tenantId, studentId, academicYearId, status: "ACTIVE" },
      });

      if (!enrollment) {
        throw new Error("Active enrollment record not found for this student.");
      }

      await tx.studentEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "WITHDRAWN",
          endedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: userId || null,
          action: "STUDENT_ENROLLMENT_WITHDRAWAL",
          resource: "StudentEnrollment",
          resourceId: enrollment.id,
          metadata: {
            studentId,
            academicYearId,
            reason,
          },
        },
      });
    });
  }

  async getStudentEnrollmentHistory(
    tenantId: string,
    studentId: string
  ): Promise<readonly StudentEnrollmentHistoryItem[]> {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { tenantId, studentId },
      include: {
        academicYear: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        section: {
          select: {
            name: true,
            code: true,
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return enrollments.map((e) => ({
      id: e.id,
      academicYearId: e.academicYear.id,
      academicYearName: e.academicYear.name,
      academicYearCode: e.academicYear.code,
      gradeLevel: e.section.grade.level,
      sectionName: e.section.name,
      sectionCode: e.section.code,
      status: e.status as StudentEnrollmentStatusType,
      enrolledAt: e.enrolledAt,
      endedAt: e.endedAt,
    }));
  }
}

export const studentAssignmentRepository = new StudentAssignmentRepository();
