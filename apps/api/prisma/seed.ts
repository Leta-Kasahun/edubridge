import { prisma, pool } from "../src/lib/prisma.js";
import { cleanDatabase } from "./seeds/clean-db.seeder.js";
import { seedRolesAndPermissions } from "./seeds/roles.seeder.js";
import { seedLookups } from "./seeds/lookups.seeder.js";
import { seedSecurityPolicy } from "./seeds/security-policy.seeder.js";
import { seedAcademicStructure } from "./seeds/academic-structure.seeder.js";
import { seedTeachers } from "./seeds/teachers.seeder.js";
import { seedStudents } from "./seeds/students.seeder.js";
import { seedSystemAdmin } from "./seeds/admin.seeder.js";
import { seedTestUsers } from "./seeds/users.seeder.js";

async function main() {
  await cleanDatabase();

  const demoTenant = await prisma.tenant.upsert({
    where: { code: "demo" },
    update: { name: "Demo School" },
    create: {
      name: "Demo School",
      code: "demo",
      status: "ACTIVE",
    },
  });

  const apexTenant = await prisma.tenant.upsert({
    where: { code: "apex" },
    update: { name: "Apex Academy" },
    create: {
      name: "Apex Academy",
      code: "apex",
      status: "ACTIVE",
    },
  });

  const tenants = [demoTenant, apexTenant];

  for (const tenant of tenants) {
    await seedRolesAndPermissions(tenant.id);
    await seedLookups(tenant.id);
    await seedSecurityPolicy(tenant.id);
  }

  await seedAcademicStructure();
  await seedTeachers();
  await seedStudents();

  await seedSystemAdmin(demoTenant.id);

  await seedTestUsers({
    demo: demoTenant.id,
    apex: apexTenant.id,
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
