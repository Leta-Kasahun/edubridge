import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";
import { generateEthiopianAcademicYears } from "../src/shared/utils/ethiopian-calendar.util.js";
import { ETHIOPIAN_STANDARD_SUBJECTS } from "../src/shared/constants/subject.constants.js";

async function seedAcademicFoundation() {
  console.log("🏫 Resetting and Recreating Clean Academic Foundation for all tenants...");

  await runWithoutTenant(async () => {
    // 1. Clean up existing academic assignments, sections, grade-subjects, grades, and academic years to eliminate duplicates
    console.log("🧹 Clearing old/duplicate academic structures...");
    await prisma.teacherAssignment.deleteMany({});
    await prisma.studentEnrollment.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.gradeSubject.deleteMany({});
    await prisma.grade.deleteMany({});
    await prisma.academicYear.deleteMany({});
    console.log("   ✅ Cleared old academic structures.");

    // 2. Ensure all standard subjects exist in the database
    console.log("📚 Verifying standard curriculum subjects...");
    const subjectMap = new Map<string, string>();

    for (const sub of ETHIOPIAN_STANDARD_SUBJECTS) {
      const record = await prisma.subject.upsert({
        where: { code: sub.code },
        update: {
          name: sub.name,
          isActive: true,
        },
        create: {
          code: sub.code,
          name: sub.name,
          description: `Standard ${sub.name} curriculum (${sub.category})`,
          isActive: true,
        },
      });
      subjectMap.set(sub.code, record.id);
    }
    console.log(`   ✅ Verified ${subjectMap.size} standard subjects.`);

    // 3. Dynamically discover all active tenants
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, code: true, name: true },
    });

    console.log(`\n🏢 Found ${tenants.length} active tenant(s): ${tenants.map((t) => t.name).join(", ")}`);

    for (const tenant of tenants) {
      console.log(`\n========================================`);
      console.log(`🏛️  Configuring Tenant: ${tenant.name} (${tenant.code})`);
      console.log(`========================================`);

      // A. Create Academic Years (e.g. "2018 E.C", "2017 E.C", etc.)
      const generatedYears = generateEthiopianAcademicYears(2010, tenant.code);
      let activeYearRecord = null;

      for (const gy of generatedYears) {
        const yearRecord = await prisma.academicYear.create({
          data: {
            tenantId: tenant.id,
            name: `${gy.year} E.C`,
            code: `AY-${gy.year}-${tenant.code.toUpperCase()}`,
            startDate: gy.startDate,
            endDate: gy.endDate,
            status: gy.status,
          },
        });

        if (gy.isCurrent) {
          activeYearRecord = yearRecord;
        }
      }

      console.log(`   ✅ Academic Years created. Active: ${activeYearRecord?.name} (ID: ${activeYearRecord?.id})`);

      // B. Create Grades 7 through 12
      const gradeLevels = [7, 8, 9, 10, 11, 12];
      const gradeMap = new Map<number, string>();

      for (const level of gradeLevels) {
        const grade = await prisma.grade.create({
          data: {
            tenantId: tenant.id,
            level,
            isActive: true,
          },
        });
        gradeMap.set(level, grade.id);
      }
      console.log(`   ✅ Grades created: Grades 7, 8, 9, 10, 11, 12`);

      // C. Map Subjects to Grades (GradeSubject)
      let mappingCount = 0;
      for (const sub of ETHIOPIAN_STANDARD_SUBJECTS) {
        const subjectId = subjectMap.get(sub.code);
        if (!subjectId) continue;

        for (const lvl of sub.defaultGrades) {
          const gradeId = gradeMap.get(lvl);
          if (!gradeId) continue;

          await prisma.gradeSubject.create({
            data: {
              gradeId,
              subjectId,
            },
          });
          mappingCount++;
        }
      }
      console.log(`   ✅ Linked ${mappingCount} grade-subject curriculum associations.`);

      // D. Create Sections for active academic year (Sections A & B for each grade)
      if (activeYearRecord) {
        let sectionCount = 0;
        for (const level of gradeLevels) {
          const gradeId = gradeMap.get(level);
          if (!gradeId) continue;

          for (const secLetter of ["A", "B"]) {
            const secCode = `G${level}-${secLetter}-${tenant.code.toUpperCase()}`;
            const secName = `Section ${secLetter}`;

            await prisma.section.create({
              data: {
                tenantId: tenant.id,
                academicYearId: activeYearRecord.id,
                gradeId,
                name: secName,
                code: secCode,
                capacity: 45,
                status: "ACTIVE",
              },
            });
            sectionCount++;
          }
        }
        console.log(`   ✅ Created ${sectionCount} class sections for active academic year.`);
      }
    }

    console.log("\n🎉 Clean academic foundation completed with zero duplicates!");
  });
}

seedAcademicFoundation()
  .catch((e) => {
    console.error("❌ Academic foundation seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
