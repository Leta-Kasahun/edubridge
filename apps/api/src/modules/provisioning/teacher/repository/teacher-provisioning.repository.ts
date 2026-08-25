import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  AccountStatus,
  TeacherStatus,
  Prisma,
} from "../../../../generated/prisma/client.js";
import {
  CreateProvisionedTeacherData,
  ProvisionedTeacherRecord,
  TeacherQueryFilters,
  PaginatedTeacherResult,
} from "../types/teacher-provisioning.types.js";

export class TeacherProvisioningRepository {
  async findTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        securityPolicy: true,
        roles: true,
      },
    });
  }

  async findTeacherRole(tenantId: string) {
    let role = await prisma.role.findFirst({
      where: {
        tenantId,
        code: "TEACHER",
      },
    });

    if (!role) {
      role = await runWithoutTenant(async () => {
        return prisma.role.create({
          data: {
            tenantId,
            name: "Teacher",
            code: "TEACHER",
            isSystem: true,
            isActive: true,
          },
        });
      });
    }

    return role;
  }

  async findTeacherByEmployeeCode(tenantId: string, employeeCode: string) {
    return prisma.teacherProfile.findFirst({
      where: {
        tenantId,
        employeeCode: {
          equals: employeeCode,
          mode: "insensitive",
        },
      },
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

  async findUserByUsername(username: string) {
    return prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });
  }

  async getNextTeacherSequence(tenantCode: string): Promise<number> {
    return runWithoutTenant(async () => {
      const count = await prisma.teacherProfile.count({
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
    });
  }

  async createProvisionedTeacher(data: CreateProvisionedTeacherData) {
    return runWithoutTenant(async () => {
      return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || null,
            username: data.username,
            passwordHash: data.passwordHash || null,
            emailVerified: data.emailVerified,
            status: data.status,
          },
        });

        const profile = await tx.teacherProfile.create({
          data: {
            tenantId: data.tenantId,
            userId: user.id,
            employeeCode: data.employeeCode,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            gender: data.gender,
            email: data.email || null,
            phoneNumber: data.phoneNumber || null,
            status: "ACTIVE",
          },
        });

        const membership = await tx.tenantMembership.create({
          data: {
            tenantId: data.tenantId,
            userId: user.id,
            status: "ACTIVE",
          },
        });

        await tx.membershipRole.create({
          data: {
            membershipId: membership.id,
            roleId: data.roleId,
          },
        });

        if (data.otp) {
          await tx.oTPCode.create({
            data: {
              userId: user.id,
              codeHash: data.otp.codeHash,
              purpose: data.otp.purpose,
              expiresAt: data.otp.expiresAt,
              attemptCount: 0,
            },
          });
        }

        let invitationRecord = null;
        if (data.invitation && data.email) {
          invitationRecord = await tx.invitation.create({
            data: {
              tenantId: data.tenantId,
              email: data.email,
              roleId: data.roleId,
              tokenHash: data.invitation.tokenHash,
              status: "PENDING",
              expiresAt: data.invitation.expiresAt,
              createdById: data.invitation.createdById,
            },
          });
        }

        const record: ProvisionedTeacherRecord = {
          id: user.id,
          teacherProfileId: profile.id,
          tenantId: data.tenantId,
          username: user.username as string,
          employeeCode: profile.employeeCode,
          firstName: profile.firstName,
          middleName: profile.middleName,
          lastName: profile.lastName,
          gender: profile.gender,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          status: user.status,
          teacherStatus: profile.status,
          emailVerified: user.emailVerified,
          membershipId: membership.id,
          createdAt: profile.createdAt,
        };

        return {
          user: record,
          profile,
          invitation: invitationRecord,
        };
      });
    });
  }

  async getTeachers(
    tenantId: string,
    filters: TeacherQueryFilters = {}
  ): Promise<PaginatedTeacherResult> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherProfileWhereInput = {
      tenantId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.search && filters.search.trim().length > 0) {
      const query = filters.search.trim();
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { middleName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { employeeCode: { contains: query, mode: "insensitive" } },
        { phoneNumber: { contains: query, mode: "insensitive" } },
        { user: { username: { contains: query, mode: "insensitive" } } },
      ];
    }

    const [total, profiles] = await Promise.all([
      prisma.teacherProfile.count({ where }),
      prisma.teacherProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        include: {
          user: {
            include: {
              memberships: {
                where: { tenantId },
              },
            },
          },
        },
      }),
    ]);

    const data: ProvisionedTeacherRecord[] = profiles.map((p) => {
      const user = p.user;
      const membership = user?.memberships[0];

      return {
        id: user?.id || p.id,
        teacherProfileId: p.id,
        tenantId: p.tenantId,
        username: user?.username || p.employeeCode,
        employeeCode: p.employeeCode,
        firstName: p.firstName,
        middleName: p.middleName,
        lastName: p.lastName,
        gender: p.gender,
        email: p.email,
        phoneNumber: p.phoneNumber,
        status: user?.status || AccountStatus.ACTIVE,
        teacherStatus: p.status,
        emailVerified: user?.emailVerified || false,
        membershipId: membership?.id || "",
        createdAt: p.createdAt,
      };
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findTeacherProfileById(tenantId: string, profileId: string): Promise<ProvisionedTeacherRecord | null> {
    const profile = await prisma.teacherProfile.findFirst({
      where: {
        id: profileId,
        tenantId,
      },
      include: {
        user: {
          include: {
            memberships: {
              where: { tenantId },
            },
          },
        },
      },
    });

    if (!profile) return null;

    const user = profile.user;
    const membership = user?.memberships[0];

    return {
      id: user?.id || profile.id,
      teacherProfileId: profile.id,
      tenantId: profile.tenantId,
      username: user?.username || profile.employeeCode,
      employeeCode: profile.employeeCode,
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      gender: profile.gender,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      status: user?.status || AccountStatus.ACTIVE,
      teacherStatus: profile.status,
      emailVerified: user?.emailVerified || false,
      membershipId: membership?.id || "",
      createdAt: profile.createdAt,
    };
  }

  async updateTeacherStatus(
    tenantId: string,
    profileId: string,
    teacherStatus: TeacherStatus,
    userStatus?: AccountStatus
  ): Promise<ProvisionedTeacherRecord | null> {
    return runWithoutTenant(async () => {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.teacherProfile.findFirst({
          where: { id: profileId, tenantId },
          include: {
            user: { include: { memberships: { where: { tenantId } } } },
          },
        });

        if (!existing) return null;

        const updatedProfile = await tx.teacherProfile.update({
          where: { id: profileId },
          data: { status: teacherStatus },
        });

        let updatedUser = existing.user;
        if (existing.userId && userStatus) {
          updatedUser = await tx.user.update({
            where: { id: existing.userId },
            data: { status: userStatus },
            include: { memberships: { where: { tenantId } } },
          });
        }

        const membership = updatedUser?.memberships[0];

        return {
          id: updatedUser?.id || updatedProfile.id,
          teacherProfileId: updatedProfile.id,
          tenantId: updatedProfile.tenantId,
          username: updatedUser?.username || updatedProfile.employeeCode,
          employeeCode: updatedProfile.employeeCode,
          firstName: updatedProfile.firstName,
          middleName: updatedProfile.middleName,
          lastName: updatedProfile.lastName,
          gender: updatedProfile.gender,
          email: updatedProfile.email,
          phoneNumber: updatedProfile.phoneNumber,
          status: updatedUser?.status || AccountStatus.ACTIVE,
          teacherStatus: updatedProfile.status,
          emailVerified: updatedUser?.emailVerified || false,
          membershipId: membership?.id || "",
          createdAt: updatedProfile.createdAt,
        };
      });
    });
  }
}

export const teacherProvisioningRepository = new TeacherProvisioningRepository();
