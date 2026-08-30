import { prisma } from "../../../../lib/prisma.js";
import {
  StudentStatus,
  AccountStatus,
  Gender,
  Prisma,
} from "../../../../generated/prisma/client.js";
import {
  ProvisionedStudentRecord,
  StudentQueryFilters,
  PaginatedStudentResult,
  AcademicStructureResponse,
  AcademicStructureAcademicYear,
  AcademicStructureGrade,
  AcademicStructureSection,
} from "../types/student-provisioning.types.js";

export class StudentProvisioningRepository {
  async findTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  async findAcademicYearById(tenantId: string, academicYearId: string) {
    return prisma.academicYear.findFirst({
      where: {
        id: academicYearId,
        tenantId,
      },
    });
  }

  async findActiveAcademicYear(tenantId: string) {
    return prisma.academicYear.findFirst({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      orderBy: { startDate: "desc" },
    });
  }

  async findGradeById(tenantId: string, gradeId: string) {
    return prisma.grade.findFirst({
      where: {
        id: gradeId,
        tenantId,
      },
    });
  }

  async findSectionById(
    tenantId: string,
    sectionId: string,
    academicYearId?: string
  ) {
    return prisma.section.findFirst({
      where: {
        id: sectionId,
        tenantId,
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
        grade: true,
      },
    });
  }

  async findSectionByName(
    tenantId: string,
    academicYearId: string,
    gradeId: string,
    name: string
  ) {
    const trimmedName = name.trim();
    return prisma.section.findFirst({
      where: {
        tenantId,
        academicYearId,
        gradeId,
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
      include: {
        grade: true,
      },
    });
  }

  async findOrCreateSection(
    tenantId: string,
    academicYearId: string,
    gradeId: string,
    name: string
  ) {
    const existing = await this.findSectionByName(
      tenantId,
      academicYearId,
      gradeId,
      name
    );
    if (existing) return existing;
    return this.createSection(tenantId, academicYearId, gradeId, name);
  }

  async findStudentRole(tenantId: string) {
    return prisma.role.findFirst({
      where: {
        tenantId,
        code: "STUDENT",
      },
    });
  }

  async findStudentProfileByCode(tenantId: string, studentCode: string) {
    return prisma.studentProfile.findFirst({
      where: {
        tenantId,
        studentCode: {
          equals: studentCode,
          mode: "insensitive",
        },
      },
      include: {
        user: true,
      },
    });
  }

  async findStudentByStudentCode(tenantId: string, studentCode: string) {
    return this.findStudentProfileByCode(tenantId, studentCode);
  }

  async findUserByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
  }

  async getNextStudentSequence(tenantCode: string): Promise<number> {
    const count = await prisma.studentProfile.count({
      where: {
        tenant: {
          code: {
            equals: tenantCode,
            mode: "insensitive",
          },
        },
      },
    });
    return count + 1;
  }

  async createGrade(tenantId: string, level: number) {
    const existing = await prisma.grade.findFirst({
      where: { tenantId, level },
    });

    if (existing) {
      if (!existing.isActive) {
        return prisma.grade.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      }
      return existing;
    }

    return prisma.grade.create({
      data: {
        tenantId,
        level,
        isActive: true,
      },
    });
  }

  async createSection(
    tenantId: string,
    academicYearId: string,
    gradeId: string,
    name: string,
    capacity?: number
  ) {
    const trimmedName = name.trim();
    const cleanCode = trimmedName.replace(/\s+/g, "").toUpperCase();
    const generatedCode = `${cleanCode}-${Date.now().toString().slice(-4)}`;

    return prisma.section.create({
      data: {
        tenantId,
        academicYearId,
        gradeId,
        name: trimmedName,
        code: generatedCode,
        capacity: capacity || null,
        status: "ACTIVE",
      },
      include: {
        grade: true,
      },
    });
  }

  async createProvisionedStudent(params: {
    tenantId: string;
    academicYearId: string;
    sectionId: string;
    firstName: string;
    middleName: string;
    lastName?: string;
    gender: Gender;
    studentCode: string;
    username: string;
    passwordHash: string;
    dateOfBirth?: Date;
    email?: string;
    nationality?: string;
    roleId: string;
    createdById?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: params.username,
          passwordHash: params.passwordHash,
          firstName: params.firstName,
          lastName: params.middleName,
          email: params.email || null,
          status: AccountStatus.PENDING_FIRST_LOGIN,
        },
      });

      const membership = await tx.tenantMembership.create({
        data: {
          tenantId: params.tenantId,
          userId: user.id,
          status: "ACTIVE",
        },
      });

      await tx.membershipRole.create({
        data: {
          membershipId: membership.id,
          roleId: params.roleId,
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          tenantId: params.tenantId,
          userId: user.id,
          studentCode: params.studentCode,
          firstName: params.firstName,
          middleName: params.middleName,
          lastName: params.lastName || null,
          gender: params.gender,
          dateOfBirth: params.dateOfBirth || null,
          nationality: params.nationality || null,
          status: StudentStatus.ACTIVE,
        },
      });

      const enrollment = await tx.studentEnrollment.create({
        data: {
          tenantId: params.tenantId,
          studentId: profile.id,
          academicYearId: params.academicYearId,
          sectionId: params.sectionId,
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

      if (params.createdById) {
        await tx.auditLog.create({
          data: {
            tenantId: params.tenantId,
            userId: params.createdById,
            action: "STUDENT_PROVISIONED",
            resource: "StudentProfile",
            resourceId: profile.id,
            metadata: {
              studentCode: profile.studentCode,
              username: user.username,
              sectionId: params.sectionId,
            },
          },
        });
      }

      const record: ProvisionedStudentRecord = {
        id: user.id,
        studentProfileId: profile.id,
        tenantId: params.tenantId,
        studentCode: profile.studentCode,
        username: user.username || params.username,
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName ?? null,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth ?? null,
        status: user.status,
        studentStatus: profile.status,
        membershipId: membership.id,
        enrollment: {
          id: enrollment.id,
          academicYearId: enrollment.academicYearId,
          sectionId: enrollment.sectionId,
          sectionName: enrollment.section.name,
          gradeLevel: enrollment.section.grade.level,
          status: enrollment.status,
        },
        createdAt: profile.createdAt,
      };

      return {
        user: record,
        profile,
        enrollment,
      };
    });
  }

  async getStudents(
    tenantId: string,
    filters: StudentQueryFilters = {}
  ): Promise<PaginatedStudentResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StudentProfileWhereInput = {
      tenantId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.accountStatus) {
      where.user = {
        status: filters.accountStatus,
      };
    }

    if (filters.academicYearId || filters.sectionId || filters.gradeId) {
      where.enrollments = {
        some: {
          tenantId,
          ...(filters.academicYearId ? { academicYearId: filters.academicYearId } : {}),
          ...(filters.sectionId ? { sectionId: filters.sectionId } : {}),
          ...(filters.gradeId ? { section: { gradeId: filters.gradeId } } : {}),
        },
      };
    }

    if (filters.search && filters.search.trim().length > 0) {
      const query = filters.search.trim();
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { middleName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { studentCode: { contains: query, mode: "insensitive" } },
        { user: { username: { contains: query, mode: "insensitive" } } },
      ];
    }

    const [total, profiles] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ firstName: "asc" }, { middleName: "asc" }],
        include: {
          user: {
            include: {
              memberships: true,
            },
          },
          enrollments: {
            include: {
              section: {
                include: {
                  grade: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const data: ProvisionedStudentRecord[] = profiles.map((p) => {
      const matchingEnrollments = p.enrollments.filter((e) => {
        if (filters.academicYearId && e.academicYearId !== filters.academicYearId) return false;
        if (filters.sectionId && e.sectionId !== filters.sectionId) return false;
        if (filters.gradeId && e.section?.gradeId !== filters.gradeId) return false;
        return true;
      });

      const latestEnrollment =
        matchingEnrollments.sort(
          (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
        )[0] || p.enrollments[0];

      return {
        id: p.user?.id || p.id,
        studentProfileId: p.id,
        tenantId: p.tenantId,
        studentCode: p.studentCode,
        username: p.user?.username || "",
        firstName: p.firstName,
        middleName: p.middleName,
        lastName: p.lastName ?? null,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth ?? null,
        status: p.user?.status || AccountStatus.PENDING_FIRST_LOGIN,
        studentStatus: p.status,
        membershipId:
          p.user?.memberships?.find((m) => m.tenantId === tenantId)?.id ||
          p.user?.memberships?.[0]?.id ||
          "",
        enrollment: latestEnrollment
          ? {
              id: latestEnrollment.id,
              academicYearId: latestEnrollment.academicYearId,
              sectionId: latestEnrollment.sectionId,
              sectionName: latestEnrollment.section?.name || "",
              gradeLevel: latestEnrollment.section?.grade?.level ?? 0,
              status: latestEnrollment.status,
            }
          : undefined,
        createdAt: p.createdAt,
      };
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findStudentProfileById(
    tenantId: string,
    profileId: string
  ): Promise<ProvisionedStudentRecord | null> {
    const profile = await prisma.studentProfile.findFirst({
      where: {
        id: profileId,
        tenantId,
      },
      include: {
        user: {
          include: {
            memberships: true,
          },
        },
        enrollments: {
          include: {
            section: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    if (!profile) return null;

    const latestEnrollment = profile.enrollments.sort(
      (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
    )[0];

    return {
      id: profile.user?.id || profile.id,
      studentProfileId: profile.id,
      tenantId: profile.tenantId,
      studentCode: profile.studentCode,
      username: profile.user?.username || "",
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName ?? null,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth ?? null,
      status: profile.user?.status || AccountStatus.PENDING_FIRST_LOGIN,
      studentStatus: profile.status,
      membershipId:
        profile.user?.memberships?.find((m) => m.tenantId === tenantId)?.id ||
        profile.user?.memberships?.[0]?.id ||
        "",
      enrollment: latestEnrollment
        ? {
            id: latestEnrollment.id,
            academicYearId: latestEnrollment.academicYearId,
            sectionId: latestEnrollment.sectionId,
            sectionName: latestEnrollment.section?.name || "",
            gradeLevel: latestEnrollment.section?.grade?.level ?? 0,
            status: latestEnrollment.status,
          }
        : undefined,
      createdAt: profile.createdAt,
    };
  }

  async updateStudentStatus(
    tenantId: string,
    profileId: string,
    studentStatus: StudentStatus,
    accountStatus: AccountStatus
  ): Promise<ProvisionedStudentRecord | null> {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.studentProfile.findFirst({
        where: { id: profileId, tenantId },
        include: { user: true },
      });

      if (!profile) return null;

      await tx.studentProfile.update({
        where: { id: profileId },
        data: { status: studentStatus },
      });

      if (profile.userId) {
        await tx.user.update({
          where: { id: profile.userId },
          data: { status: accountStatus },
        });

        await tx.tenantMembership.updateMany({
          where: { tenantId, userId: profile.userId },
          data: {
            status: accountStatus === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
          },
        });
      }

      return this.findStudentProfileById(tenantId, profileId);
    });
  }

  async getAcademicStructure(
    tenantId: string,
    targetAcademicYearId?: string
  ): Promise<AcademicStructureResponse> {
    const academicYears = await prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: { startDate: "desc" },
    });

    const activeYear = targetAcademicYearId
      ? academicYears.find((y) => y.id === targetAcademicYearId)
      : academicYears.find((y) => y.status === "ACTIVE") || academicYears[0];

    const currentYearId = activeYear?.id;

    const grades = await prisma.grade.findMany({
      where: { tenantId, isActive: true },
      orderBy: { level: "asc" },
      include: {
        sections: currentYearId
          ? {
              where: { academicYearId: currentYearId },
              orderBy: { name: "asc" },
              include: {
                _count: {
                  select: {
                    enrollments: {
                      where: {
                        status: "ACTIVE",
                        academicYearId: currentYearId,
                      },
                    },
                  },
                },
              },
            }
          : false,
      },
    });

    const academicYearsList: AcademicStructureAcademicYear[] = await Promise.all(
      academicYears.map(async (ay) => {
        const isCurrent = ay.id === currentYearId;

        const gradeItems: AcademicStructureGrade[] = await Promise.all(
          grades.map(async (g) => {
            const sectionsForYear = await prisma.section.findMany({
              where: {
                tenantId,
                gradeId: g.id,
                academicYearId: ay.id,
              },
              orderBy: { name: "asc" },
              include: {
                _count: {
                  select: {
                    enrollments: {
                      where: {
                        status: "ACTIVE",
                        academicYearId: ay.id,
                      },
                    },
                  },
                },
              },
            });

            const extractKey = (name: string) => {
              const cleaned = name
                .trim()
                .toLowerCase()
                .replace(/^(section|sec\.?|class|room)\s+/i, "")
                .trim();
              return cleaned || name.trim().toLowerCase();
            };

            const sectionItems: AcademicStructureSection[] = sectionsForYear
              .map((s) => ({
                id: s.id,
                name: s.name,
                code: s.code,
                capacity: s.capacity,
                studentCount: s._count.enrollments,
              }))
              .sort((a, b) =>
                extractKey(a.name).localeCompare(extractKey(b.name), undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );

            const gradeStudentCount = sectionItems.reduce((acc, curr) => acc + curr.studentCount, 0);

            return {
              id: g.id,
              level: g.level,
              studentCount: gradeStudentCount,
              sections: sectionItems,
            };
          })
        );

        return {
          id: ay.id,
          name: ay.name,
          code: ay.code,
          status: ay.status,
          isCurrent,
          grades: gradeItems,
        };
      })
    );

    const selected = academicYearsList.find((ay) => ay.id === currentYearId);

    return {
      academicYears: academicYearsList,
      currentAcademicYear: selected,
    };
  }
}

export const studentProvisioningRepository = new StudentProvisioningRepository();
