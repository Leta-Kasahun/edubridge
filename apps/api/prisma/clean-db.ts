import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";
import { ETHIOPIAN_STANDARD_SUBJECTS } from "../src/shared/constants/subject.constants.js";

async function cleanDatabase() {
  console.log("🚀 Starting database cleanup...");

  await runWithoutTenant(async () => {
    // 1. Identify users to keep (SYSTEM_ADMIN and SCHOOL_ADMIN)
    const adminRoles = await prisma.role.findMany({
      where: {
        code: { in: ["SYSTEM_ADMIN", "SCHOOL_ADMIN"] },
      },
      select: { id: true, code: true },
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

    // Also keep users with system-admin or admin usernames / emails as fallback
    const fallbackAdmins = await prisma.user.findMany({
      where: {
        OR: [
          { email: "letakasahun4@gmail.com" },
          { email: "letakasahun2@gmail.com" },
          { email: "admin.apex@edubridge.edu" },
        ],
      },
      select: { id: true, email: true, username: true },
    });
    for (const u of fallbackAdmins) {
      adminUserIds.add(u.id);
    }

    console.log(`🛡️  Preserving ${adminUserIds.size} admin users (SYSTEM_ADMIN & SCHOOL_ADMIN).`);

    // 2. Delete teacher-related records
    console.log("🧹 Deleting teacher assignments, qualifications, experiences, and profiles...");
    const deletedTeacherAssignments = await prisma.teacherAssignment.deleteMany({});
    console.log(`   - Deleted ${deletedTeacherAssignments.count} teacher assignments`);

    const deletedTeacherQualifications = await prisma.teacherQualification.deleteMany({});
    console.log(`   - Deleted ${deletedTeacherQualifications.count} teacher qualifications`);

    const deletedTeacherExperiences = await prisma.teacherExperience.deleteMany({});
    console.log(`   - Deleted ${deletedTeacherExperiences.count} teacher experiences`);

    const deletedTeacherProfiles = await prisma.teacherProfile.deleteMany({});
    console.log(`   - Deleted ${deletedTeacherProfiles.count} teacher profiles`);

    // 3. Delete student-related records
    console.log("🧹 Deleting student enrollments, contacts, and profiles...");
    const deletedEnrollments = await prisma.studentEnrollment.deleteMany({});
    console.log(`   - Deleted ${deletedEnrollments.count} student enrollments`);

    const deletedStudentContacts = await prisma.studentContact.deleteMany({});
    console.log(`   - Deleted ${deletedStudentContacts.count} student contact links`);

    const deletedContacts = await prisma.contact.deleteMany({});
    console.log(`   - Deleted ${deletedContacts.count} contacts`);

    const deletedStudentProfiles = await prisma.studentProfile.deleteMany({});
    console.log(`   - Deleted ${deletedStudentProfiles.count} student profiles`);

    // 4. Delete import batches and rows
    console.log("🧹 Deleting import batches and rows...");
    const deletedImportRows = await prisma.importRow.deleteMany({});
    console.log(`   - Deleted ${deletedImportRows.count} import rows`);

    const deletedImportBatches = await prisma.importBatch.deleteMany({});
    console.log(`   - Deleted ${deletedImportBatches.count} import batches`);

    // 5. Delete sections
    console.log("🧹 Deleting sections...");
    const deletedSections = await prisma.section.deleteMany({});
    console.log(`   - Deleted ${deletedSections.count} sections`);

    // 6. Delete grade-subjects and grades
    console.log("🧹 Deleting grade-subjects and grades...");
    const deletedGradeSubjects = await prisma.gradeSubject.deleteMany({});
    console.log(`   - Deleted ${deletedGradeSubjects.count} grade-subject associations`);

    const deletedGrades = await prisma.grade.deleteMany({});
    console.log(`   - Deleted ${deletedGrades.count} grades`);

    // 7. Delete non-admin users and their related auth data
    console.log("🧹 Removing all non-admin users (teachers, students, etc.)...");
    const usersToDelete = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(adminUserIds) },
      },
      select: { id: true, email: true, username: true },
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

      const deletedUsers = await prisma.user.deleteMany({
        where: { id: { in: userIdsToDelete } },
      });
      console.log(`   - Deleted ${deletedUsers.count} non-admin user accounts.`);
    }

    // 8. Delete all existing subjects and seed fresh standard subjects
    console.log("🧹 Resetting subjects...");
    const deletedSubjects = await prisma.subject.deleteMany({});
    console.log(`   - Deleted ${deletedSubjects.count} old subjects`);

    console.log("✨ Seeding fresh standard subjects...");
    let seededSubjectCount = 0;
    for (const sub of ETHIOPIAN_STANDARD_SUBJECTS) {
      await prisma.subject.create({
        data: {
          code: sub.code,
          name: sub.name,
          description: `Standard ${sub.name} curriculum (${sub.category})`,
          isActive: true,
        },
      });
      seededSubjectCount++;
    }
    console.log(`   - Created ${seededSubjectCount} fresh subjects.`);

    // 9. Summary of remaining data
    const remainingUsers = await prisma.user.findMany({
      select: { id: true, email: true, username: true, firstName: true, lastName: true },
    });
    console.log("\n✅ Database Reset Complete! Remaining users in database:");
    for (const u of remainingUsers) {
      console.log(`   👤 ${u.firstName} ${u.lastName} (${u.email || u.username})`);
    }
  });
}

cleanDatabase()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
