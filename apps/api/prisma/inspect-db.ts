import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";

async function main() {
  await runWithoutTenant(async () => {
    const tenants = await prisma.tenant.findMany({ select: { id: true, name: true, code: true } });
    console.log("=== DB SUMMARY ===");
    for (const t of tenants) {
      const teachers = await prisma.teacherProfile.count({ where: { tenantId: t.id } });
      const students = await prisma.studentProfile.count({ where: { tenantId: t.id } });
      const enrollments = await prisma.studentEnrollment.count({ where: { tenantId: t.id, status: "ACTIVE" } });
      const sections = await prisma.section.count({ where: { tenantId: t.id } });
      const years = await prisma.academicYear.findMany({ where: { tenantId: t.id }, select: { id: true, name: true, status: true } });
      const grades = await prisma.grade.findMany({ where: { tenantId: t.id }, select: { id: true, level: true } });

      console.log(`🏫 Tenant ${t.name} (${t.code}):`);
      console.log(`   - Academic Years: ${years.map((y) => `${y.name} [${y.status}]`).join(", ")}`);
      console.log(`   - Grades: ${grades.map((g) => `G${g.level}`).join(", ")}`);
      console.log(`   - Sections: ${sections}`);
      console.log(`   - Active Teachers: ${teachers}`);
      console.log(`   - Active Students: ${students} (Active Enrollments: ${enrollments})`);
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
