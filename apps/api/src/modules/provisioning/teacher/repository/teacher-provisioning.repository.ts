import { prisma, runWithoutTenant } from "../../../../lib/prisma.js";
import {
  CreateProvisionedTeacherData,
  ProvisionedTeacherRecord,
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
        };

        return {
          user: record,
          profile,
          invitation: invitationRecord,
        };
      });
    });
  }
}

export const teacherProvisioningRepository = new TeacherProvisioningRepository();
