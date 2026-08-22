import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  AccountStatus,
  TeacherStatus,
  Prisma,
} from "../../../../generated/prisma/client.js";
import {
  TeacherQueryFilters,
  UpdateTeacherProfileData,
  PaginatedTeacherResult,
  ProvisionedTeacherRecord,
} from "../types/teacher-provisioning.types.js";

export class TeacherManagementRepository {
  async findTeacherProfileById(tenantId: string, profileId: string) {
    return prisma.teacherProfile.findFirst({
      where: {
        id: profileId,
        tenantId,
      },
      include: {
        user: {
          include: {
            memberships: {
              where: { tenantId },
              include: {
                roles: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
        address: true,
        assignments: {
          include: {
            academicYear: true,
            section: true,
          },
        },
      },
    });
  }

  async findTeacherProfileByUserId(tenantId: string, userId: string) {
    return prisma.teacherProfile.findFirst({
      where: {
        userId,
        tenantId,
      },
      include: {
        user: true,
        address: true,
      },
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

  async updateTeacherProfile(
    tenantId: string,
    profileId: string,
    data: UpdateTeacherProfileData
  ): Promise<ProvisionedTeacherRecord | null> {
    return runWithoutTenant(async () => {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.teacherProfile.findFirst({
          where: { id: profileId, tenantId },
          include: { user: { include: { memberships: { where: { tenantId } } } } },
        });

        if (!existing) return null;

        const updatedProfile = await tx.teacherProfile.update({
          where: { id: profileId },
          data: {
            firstName: data.firstName !== undefined ? data.firstName : existing.firstName,
            middleName: data.middleName !== undefined ? data.middleName : existing.middleName,
            lastName: data.lastName !== undefined ? data.lastName : existing.lastName,
            gender: data.gender !== undefined ? data.gender : existing.gender,
            dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : existing.dateOfBirth,
            phoneNumber: data.phoneNumber !== undefined ? data.phoneNumber : existing.phoneNumber,
            email: data.email !== undefined ? data.email : existing.email,
            status: data.status !== undefined ? data.status : existing.status,
          },
        });

        let updatedUser = existing.user;
        if (existing.userId) {
          updatedUser = await tx.user.update({
            where: { id: existing.userId },
            data: {
              firstName: data.firstName !== undefined ? data.firstName : existing.user?.firstName,
              lastName: data.lastName !== undefined ? data.lastName : existing.user?.lastName,
              email: data.email !== undefined ? data.email : existing.user?.email,
            },
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
        };
      });
    });
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
          include: { user: { include: { memberships: { where: { tenantId } } } } },
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
        };
      });
    });
  }
}

export const teacherManagementRepository = new TeacherManagementRepository();
