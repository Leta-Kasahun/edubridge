import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";
import { hashPassword } from "../../src/shared/auth/password.js";
import { TEST_USERS } from "../data/users.data.js";
import { AccountStatus } from "../../src/generated/prisma/client.js";

export async function seedTestUsers(tenants: Record<string, string>) {
  return runWithoutTenant(async () => {
    const createdUsers = [];

    for (const item of TEST_USERS) {
      const tenantId = tenants[item.tenantCode];
      if (!tenantId) {
        continue;
      }

      const passwordHash = await hashPassword(item.password);

      const user = await prisma.user.upsert({
        where: { email: item.email },
        update: {
          username: item.username,
          firstName: item.firstName,
          lastName: item.lastName,
          passwordHash,
          status: item.status as AccountStatus,
          emailVerified: item.emailVerified,
        },
        create: {
          email: item.email,
          username: item.username,
          firstName: item.firstName,
          lastName: item.lastName,
          passwordHash,
          status: item.status as AccountStatus,
          emailVerified: item.emailVerified,
        },
      });

      const membership = await prisma.tenantMembership.upsert({
        where: {
          tenantId_userId: {
            tenantId,
            userId: user.id,
          },
        },
        update: {
          status: "ACTIVE",
        },
        create: {
          tenantId,
          userId: user.id,
          status: "ACTIVE",
        },
      });

      const role = await prisma.role.findFirst({
        where: {
          tenantId,
          code: item.roleCode,
        },
      });

      if (role) {
        await prisma.membershipRole.upsert({
          where: {
            membershipId_roleId: {
              membershipId: membership.id,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            membershipId: membership.id,
            roleId: role.id,
          },
        });
      }

      if (item.roleCode === "STUDENT") {
        const studentCode = `${item.tenantCode.toUpperCase()}STU_${item.username.toUpperCase()}`;
        const profile = await prisma.studentProfile.upsert({
          where: {
            tenantId_studentCode: {
              tenantId,
              studentCode,
            },
          },
          update: {
            userId: user.id,
            firstName: item.firstName,
            middleName: "Demo",
            lastName: item.lastName,
            status: "ACTIVE",
          },
          create: {
            tenantId,
            userId: user.id,
            studentCode,
            firstName: item.firstName,
            middleName: "Demo",
            lastName: item.lastName,
            gender: "MALE",
            status: "ACTIVE",
          },
        });

        const activeYear = await prisma.academicYear.findFirst({
          where: { tenantId, status: "ACTIVE" },
        });

        if (activeYear) {
          const section = await prisma.section.findFirst({
            where: { tenantId, academicYearId: activeYear.id },
            orderBy: { name: "asc" },
          });

          if (section) {
            await prisma.studentEnrollment.upsert({
              where: {
                studentId_academicYearId: {
                  studentId: profile.id,
                  academicYearId: activeYear.id,
                },
              },
              update: {
                sectionId: section.id,
                status: "ACTIVE",
              },
              create: {
                tenantId,
                studentId: profile.id,
                academicYearId: activeYear.id,
                sectionId: section.id,
                status: "ACTIVE",
              },
            });
          }
        }
      }

      if (item.roleCode === "TEACHER") {
        const employeeCode = `${item.tenantCode.toUpperCase()}TCH_${item.username.toUpperCase()}`;
        await prisma.teacherProfile.upsert({
          where: {
            tenantId_employeeCode: {
              tenantId,
              employeeCode,
            },
          },
          update: {
            userId: user.id,
            firstName: item.firstName,
            middleName: "Demo",
            lastName: item.lastName,
            status: "ACTIVE",
          },
          create: {
            tenantId,
            userId: user.id,
            employeeCode,
            firstName: item.firstName,
            middleName: "Demo",
            lastName: item.lastName,
            gender: "MALE",
            status: "ACTIVE",
          },
        });
      }

      createdUsers.push(user);
    }

    return createdUsers;
  });
}
