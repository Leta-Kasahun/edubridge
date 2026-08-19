import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";
import { hashPassword } from "../../src/shared/auth/password.js";

export async function seedSystemAdmin(tenantId: string) {
  return runWithoutTenant(async () => {
    const rawPassword = process.env.SYSTEM_ADMIN_PASSWORD || "Admin@123";
    const passwordHash = await hashPassword(rawPassword);

    const user = await prisma.user.upsert({
      where: { email: "letakasahun4@gmail.com" },
      update: {
        username: "letakasahun4",
        firstName: "System",
        lastName: "Admin",
        passwordHash,
        status: "ACTIVE",
        emailVerified: true,
      },
      create: {
        email: "letakasahun4@gmail.com",
        username: "letakasahun4",
        firstName: "System",
        lastName: "Admin",
        passwordHash,
        status: "ACTIVE",
        emailVerified: true,
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

    const systemAdminRole = await prisma.role.findFirst({
      where: {
        tenantId,
        code: "SYSTEM_ADMIN",
      },
    });

    if (systemAdminRole) {
      await prisma.membershipRole.upsert({
        where: {
          membershipId_roleId: {
            membershipId: membership.id,
            roleId: systemAdminRole.id,
          },
        },
        update: {},
        create: {
          membershipId: membership.id,
          roleId: systemAdminRole.id,
        },
      });
    }

    return user;
  });
}
