import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import { Prisma, TenantStatus } from "../../../../generated/prisma/client.js";
import { generateTenantCode } from "../../../../shared/utils/generators.js";
import {
  CreateProvisionedUserData,
  ProvisionedUserRecord,
  TenantListItem,
  TenantQueryFilters,
  PaginatedTenantResult,
} from "../types/tenant-provisioning.types.js";

export class TenantProvisioningRepository {
  async getTenants(filters: TenantQueryFilters = {}): Promise<PaginatedTenantResult> {
    return runWithoutTenant(async () => {
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(100, Math.max(1, filters.limit || 20));
      const skip = (page - 1) * limit;

      const where: Prisma.TenantWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim();
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          {
            memberships: {
              some: {
                roles: {
                  some: {
                    role: {
                      code: "SCHOOL_ADMIN",
                    },
                  },
                },
                user: {
                  OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { username: { contains: query, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
        ];
      }

      const [total, tenants] = await Promise.all([
        prisma.tenant.count({ where }),
        prisma.tenant.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            memberships: {
              where: {
                roles: {
                  some: {
                    role: {
                      code: "SCHOOL_ADMIN",
                    },
                  },
                },
              },
              include: {
                user: true,
              },
              take: 1,
            },
            _count: {
              select: {
                teacherProfiles: true,
                studentProfiles: true,
              },
            },
          },
        }),
      ]);

      const data: TenantListItem[] = tenants.map((t) => {
        const adminMembership = t.memberships[0];
        const adminUser = adminMembership?.user;

        return {
          id: t.id,
          name: t.name,
          code: t.code,
          status: t.status,
          admin: adminUser
            ? {
                id: adminUser.id,
                username: adminUser.username ?? "",
                email: adminUser.email,
                firstName: adminUser.firstName,
                lastName: adminUser.lastName,
                status: adminUser.status,
                emailVerified: adminUser.emailVerified,
              }
            : undefined,
          totalTeachers: t._count.teacherProfiles,
          totalStudents: t._count.studentProfiles,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
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
    });
  }

  async findTenantWithDetails(tenantId: string): Promise<TenantListItem | null> {
    return runWithoutTenant(async () => {
      const t = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          memberships: {
            where: {
              roles: {
                some: {
                  role: {
                    code: "SCHOOL_ADMIN",
                  },
                },
              },
            },
            include: {
              user: true,
            },
            take: 1,
          },
          _count: {
            select: {
              teacherProfiles: true,
              studentProfiles: true,
            },
          },
        },
      });

      if (!t) return null;

      const adminMembership = t.memberships[0];
      const adminUser = adminMembership?.user;

      return {
        id: t.id,
        name: t.name,
        code: t.code,
        status: t.status,
        admin: adminUser
          ? {
              id: adminUser.id,
              username: adminUser.username ?? "",
              email: adminUser.email,
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              status: adminUser.status,
              emailVerified: adminUser.emailVerified,
            }
          : undefined,
        totalTeachers: t._count.teacherProfiles,
        totalStudents: t._count.studentProfiles,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });
  }

  async updateTenantStatus(tenantId: string, status: TenantStatus) {
    return runWithoutTenant(async () => {
      return prisma.tenant.update({
        where: { id: tenantId },
        data: { status },
      });
    });
  }

  async findTenantById(tenantId: string) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        securityPolicy: true,
        roles: true,
      },
    });
  }

  async findTenantByName(name: string) {
    return prisma.tenant.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      include: {
        securityPolicy: true,
        roles: true,
      },
    });
  }

  async findTenantByIdOrName(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    return prisma.tenant.findFirst({
      where: isUuid
        ? { id: identifier }
        : {
            OR: [
              { name: { equals: identifier, mode: "insensitive" } },
              { code: { equals: identifier, mode: "insensitive" } },
            ],
          },
      include: {
        securityPolicy: true,
        roles: true,
      },
    });
  }

  async ensureTenantAndRole(identifier: string) {
    return runWithoutTenant(async () => {
      let tenant = await this.findTenantByIdOrName(identifier);

      if (!tenant) {
        let code = generateTenantCode(identifier);
        let existingCodeTenant = await prisma.tenant.findUnique({ where: { code } });
        let suffix = 1;
        while (existingCodeTenant) {
          code = `${generateTenantCode(identifier)}${suffix}`.slice(0, 8);
          existingCodeTenant = await prisma.tenant.findUnique({ where: { code } });
          suffix += 1;
        }

        tenant = await prisma.tenant.create({
          data: {
            name: identifier,
            code,
            status: "ACTIVE",
            securityPolicy: {
              create: {
                minPasswordLength: 8,
                maxPasswordLength: 128,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxFailedAttempts: 5,
                failedAttemptWindowMinutes: 15,
                lockoutDurationMinutes: 15,
                sessionTimeoutMinutes: 60,
              },
            },
            roles: {
              create: [
                {
                  name: "School Administrator",
                  code: "SCHOOL_ADMIN",
                  isSystem: true,
                  isActive: true,
                },
                {
                  name: "Teacher",
                  code: "TEACHER",
                  isSystem: true,
                  isActive: true,
                },
                {
                  name: "Student",
                  code: "STUDENT",
                  isSystem: true,
                  isActive: true,
                },
              ],
            },
          },
          include: {
            securityPolicy: true,
            roles: true,
          },
        });
      }

      let role = tenant.roles.find((r) => r.code === "SCHOOL_ADMIN");
      if (!role) {
        role = await prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: "School Administrator",
            code: "SCHOOL_ADMIN",
            isSystem: true,
            isActive: true,
          },
        });
      }

      return { tenant, role };
    });
  }

  async findRoleByCode(tenantId: string, roleCode: string) {
    return prisma.role.findFirst({
      where: {
        tenantId,
        code: roleCode,
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

  async countRoleMemberships(tenantId: string, roleCode: string): Promise<number> {
    return prisma.membershipRole.count({
      where: {
        membership: {
          tenantId,
        },
        role: {
          code: roleCode,
        },
      },
    });
  }

  async createProvisionedUser(data: CreateProvisionedUserData) {
    return runWithoutTenant(async () => {
      return prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.findUnique({
          where: { id: data.tenantId },
          select: { id: true, name: true, code: true },
        });

        const user = await tx.user.create({
          data: {
            email: data.email || null,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            passwordHash: data.passwordHash,
            status: data.status,
            emailVerified: data.emailVerified,
          },
        });

        const membership = await tx.tenantMembership.create({
          data: {
            tenantId: data.tenantId,
            userId: user.id,
            status: "ACTIVE",
          },
        });

        const membershipRole = await tx.membershipRole.create({
          data: {
            membershipId: membership.id,
            roleId: data.roleId,
          },
          include: {
            role: true,
          },
        });

        let invitationRecord = null;
        if (data.invitation && data.email) {
          invitationRecord = await tx.invitation.create({
            data: {
              tenantId: data.tenantId,
              email: data.email,
              roleId: data.roleId,
              tokenHash: data.invitation.tokenHash,
              status: data.invitation.status ?? "PENDING",
              expiresAt: data.invitation.expiresAt,
              createdById: data.invitation.createdById || user.id,
            },
          });
        }

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

        const userRecord: ProvisionedUserRecord = {
          id: user.id,
          tenantId: data.tenantId,
          tenantName: tenant?.name ?? "",
          username: user.username ?? data.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          emailVerified: user.emailVerified,
          roles: [membershipRole.role.code],
          membershipId: membership.id,
        };

        return {
          user: userRecord,
          invitation: invitationRecord,
        };
      });
    });
  }

  async findProvisionedUserById(userId: string, tenantId: string): Promise<ProvisionedUserRecord | null> {
    const membership = await prisma.tenantMembership.findFirst({
      where: {
        userId,
        tenantId,
      },
      include: {
        user: true,
        tenant: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!membership || !membership.user) {
      return null;
    }

    return {
      id: membership.user.id,
      tenantId: membership.tenantId,
      tenantName: membership.tenant?.name ?? "",
      username: membership.user.username ?? "",
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      status: membership.user.status,
      emailVerified: membership.user.emailVerified,
      roles: membership.roles.map((r) => r.role.code),
      membershipId: membership.id,
    };
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            tenant: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    });
  }
}

export const tenantProvisioningRepository = new TenantProvisioningRepository();
