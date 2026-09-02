import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";

export async function cleanDatabase() {
  await runWithoutTenant(async () => {
    const adminRoles = await prisma.role.findMany({
      where: {
        code: { in: ["SYSTEM_ADMIN", "SCHOOL_ADMIN"] },
      },
      select: { id: true },
    });

    const adminRoleIds = adminRoles.map((r) => r.id);

    const adminMemberships = await prisma.membershipRole.findMany({
      where: {
        roleId: { in: adminRoleIds },
      },
      select: {
        membership: {
          select: {
            userId: true,
          },
        },
      },
    });

    const adminUserIds = new Set<string>();
    for (const item of adminMemberships) {
      if (item.membership?.userId) {
        adminUserIds.add(item.membership.userId);
      }
    }

    const fallbackAdmins = await prisma.user.findMany({
      where: {
        OR: [
          { email: "letakasahun4@gmail.com" },
          { email: "letakasahun2@gmail.com" },
          { email: "admin.apex@edubridge.edu" },
        ],
      },
      select: { id: true },
    });
    for (const u of fallbackAdmins) {
      adminUserIds.add(u.id);
    }

    await prisma.teacherAssignment.deleteMany({});
    await prisma.teacherQualification.deleteMany({});
    await prisma.teacherExperience.deleteMany({});
    await prisma.teacherProfile.deleteMany({});

    await prisma.studentEnrollment.deleteMany({});
    await prisma.studentContact.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.studentProfile.deleteMany({});

    await prisma.importRow.deleteMany({});
    await prisma.importBatch.deleteMany({});

    await prisma.section.deleteMany({});
    await prisma.gradeSubject.deleteMany({});
    await prisma.grade.deleteMany({});

    const usersToDelete = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(adminUserIds) },
      },
      select: { id: true },
    });

    const userIdsToDelete = usersToDelete.map((u) => u.id);

    if (userIdsToDelete.length > 0) {
      await prisma.session.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      await prisma.oTPCode.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      await prisma.loginAttempt.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      await prisma.securityEvent.deleteMany({
        where: {
          OR: [
            { userId: { in: userIdsToDelete } },
            { resolvedById: { in: userIdsToDelete } },
          ],
        },
      });
      await prisma.auditLog.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });
      await prisma.membershipRole.deleteMany({
        where: {
          membership: {
            userId: { in: userIdsToDelete },
          },
        },
      });
      await prisma.tenantMembership.deleteMany({
        where: { userId: { in: userIdsToDelete } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: userIdsToDelete } },
      });
    }
  });
}
