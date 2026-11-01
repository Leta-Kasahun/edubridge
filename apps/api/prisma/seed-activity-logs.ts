import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";

async function main() {
  await runWithoutTenant(async () => {
    const demoTenant = await prisma.tenant.findUnique({ where: { code: "demo" } });
    const apexTenant = await prisma.tenant.findUnique({ where: { code: "apex" } });

    if (!demoTenant) {
      console.error("Demo tenant not found");
      return;
    }

    const demoAdmin = await prisma.user.findFirst({ where: { email: "letakasahun2@gmail.com" } });
    const demoTeacher = await prisma.user.findFirst({ where: { email: "letakasahun5@gmail.com" } });

    const apexAdmin = await prisma.user.findFirst({ where: { email: "admin.apex@edubridge.edu" } });
    const apexTeacher = await prisma.user.findFirst({ where: { email: "teacher.apex@edubridge.edu" } });
    const systemAdmin = await prisma.user.findFirst({ where: { email: "letakasahun4@gmail.com" } });

    const now = new Date();
    const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);
    const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600 * 1000);
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 3600 * 1000);

    const activitiesToSeed = [
      // 1. Authentication
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "LOGIN",
        resource: "AUTH",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "School Administrator logged into the portal",
          device: "Chrome on macOS",
          location: "Addis Ababa, ET",
        },
        createdAt: minutesAgo(8),
      },
      // 2. Student Registration & Profile
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "CREATE",
        resource: "STUDENT",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Registered new student roster entry: Abebe Kebede (ID: ET-2026-0842)",
          studentName: "Abebe Kebede",
          gradeLevel: 10,
          admissionNumber: "ET-2026-0842",
        },
        createdAt: minutesAgo(24),
      },
      // 3. Class assignment & enrollment
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "ENROLL",
        resource: "ENROLLMENT",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Assigned student Abebe Kebede to Section 10-A (Academic Year 2019 E.C)",
          sectionName: "Section 10-A",
          academicYear: "2019 E.C",
        },
        createdAt: minutesAgo(35),
      },
      // 4. Attendance
      {
        tenantId: demoTenant.id,
        userId: demoTeacher?.id,
        action: "CREATE",
        resource: "ATTENDANCE",
        ipAddress: "192.168.1.84",
        metadata: {
          description: "Recorded morning attendance for Grade 10-A (38 Present, 2 Absent, 1 Late)",
          section: "Grade 10-A",
          presentCount: 38,
          absentCount: 2,
        },
        createdAt: hoursAgo(1),
      },
      // 5. Assessment and Examination
      {
        tenantId: demoTenant.id,
        userId: demoTeacher?.id,
        action: "PUBLISH",
        resource: "ASSESSMENT",
        ipAddress: "192.168.1.84",
        metadata: {
          description: "Published Mid-Term Examination: Grade 10 Physics (Mechanics & Waves)",
          assessmentTitle: "Mid-Term Examination: Physics",
          durationMinutes: 90,
          totalQuestions: 40,
        },
        createdAt: hoursAgo(2),
      },
      // 6. Grade and academic performance updates
      {
        tenantId: demoTenant.id,
        userId: demoTeacher?.id,
        action: "GRADE",
        resource: "GRADE",
        ipAddress: "192.168.1.84",
        metadata: {
          description: "Finalized rubric marks for Unit 3 Chemistry Lab Reports (28 submissions graded)",
          course: "Chemistry Grade 10",
          gradedCount: 28,
          classAverage: "84.2%",
        },
        createdAt: hoursAgo(3),
      },
      // 7. Teacher and Staff Management
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "UPDATE",
        resource: "TEACHER",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Updated teaching credentials and assigned Secondary Mathematics lead role",
          teacherName: "Leta Teacher",
          department: "Mathematics & Natural Sciences",
        },
        createdAt: hoursAgo(4),
      },
      // 8. Academic and Curriculum Management
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "UPDATE",
        resource: "CURRICULUM",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Approved Ethiopian National Curriculum alignment for Grade 9-10 Biology",
          curriculumCode: "MOE-BIO-G10-2026",
          status: "APPROVED",
        },
        createdAt: hoursAgo(6),
      },
      // 9. Competency and Mastery Tracking
      {
        tenantId: demoTenant.id,
        userId: demoTeacher?.id,
        action: "UPDATE",
        resource: "MASTERY",
        ipAddress: "192.168.1.84",
        metadata: {
          description: "Recalculated competency mastery thresholds for Section 10-A Algebra",
          benchmarkStandard: "80% Mastery Benchmark",
          studentsProficient: 34,
        },
        createdAt: hoursAgo(9),
      },
      // 10. Parent and Guardian Management
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "CREATE",
        resource: "PARENT",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Linked primary guardian contact details for student Martha Tadesse",
          guardianName: "Tadesse Woldemariam",
          contactPhone: "+251 91 123 4567",
        },
        createdAt: hoursAgo(14),
      },
      // 11. School User and Permission Management
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "UPDATE",
        resource: "USER_PERMISSION",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Updated examination grading permissions for Assistant Teachers group",
          permissionChanged: "assessment:grade:execute",
          roleTarget: "TEACHER_ASSISTANT",
        },
        createdAt: daysAgo(1),
      },
      // 12. School Configuration Changes
      {
        tenantId: demoTenant.id,
        userId: demoAdmin?.id,
        action: "UPDATE",
        resource: "CONFIGURATION",
        ipAddress: "192.168.1.105",
        metadata: {
          description: "Updated term schedule: Semester II Final Exam window set to Sene 12-24",
          academicYear: "2019 E.C",
          semester: "Semester II",
        },
        createdAt: daysAgo(2),
      },

      // Apex Academy activities (isolated to Apex tenant!)
      {
        tenantId: apexTenant?.id,
        userId: apexAdmin?.id,
        action: "LOGIN",
        resource: "AUTH",
        ipAddress: "10.0.4.12",
        metadata: {
          description: "School Administrator logged in to Apex Academy workspace",
          device: "Firefox on Windows 11",
        },
        createdAt: minutesAgo(12),
      },
      {
        tenantId: apexTenant?.id,
        userId: apexAdmin?.id,
        action: "CREATE",
        resource: "TEACHER",
        ipAddress: "10.0.4.12",
        metadata: {
          description: "Onboarded Senior English Literature Instructor: John Keating",
          staffId: "APEX-ST-0091",
        },
        createdAt: hoursAgo(5),
      },
      {
        tenantId: apexTenant?.id,
        userId: apexTeacher?.id,
        action: "CREATE",
        resource: "ASSESSMENT",
        ipAddress: "10.0.4.88",
        metadata: {
          description: "Generated Diagnostic Mock Test: English Vocabulary & Grammar",
          totalMarks: 50,
        },
        createdAt: hoursAgo(8),
      },
      {
        tenantId: apexTenant?.id,
        userId: apexAdmin?.id,
        action: "UPDATE",
        resource: "CONFIGURATION",
        ipAddress: "10.0.4.12",
        metadata: {
          description: "Enabled automated SMS delivery for student attendance alerts",
          gateway: "EthioTelecom Bulk SMS",
        },
        createdAt: daysAgo(3),
      },

      // System Admin cross-school activity
      {
        tenantId: null,
        userId: systemAdmin?.id,
        action: "UPDATE",
        resource: "SECURITY",
        ipAddress: "172.16.0.1",
        metadata: {
          description: "System Administrator updated national platform multi-tenant password policy",
          enforce2FAForAdmins: true,
          sessionTimeoutMinutes: 60,
        },
        createdAt: hoursAgo(18),
      },
      {
        tenantId: null,
        userId: systemAdmin?.id,
        action: "CREATE",
        resource: "CONFIGURATION",
        ipAddress: "172.16.0.1",
        metadata: {
          description: "Added system-wide regional lookup data: Oromia & Sidama administrative zones",
          regionsAdded: ["Oromia", "Sidama"],
        },
        createdAt: daysAgo(2),
      },
    ];

    for (const item of activitiesToSeed) {
      await prisma.auditLog.create({
        data: item,
      });
    }

    console.log(`Successfully seeded ${activitiesToSeed.length} activity log entries!`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

