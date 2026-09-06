import { prisma, pool } from "../src/lib/prisma.js";
import { seedTestUsers } from "./seeds/users.seeder.js";

async function main() {
  const demoTenant = await prisma.tenant.findUnique({ where: { code: "demo" } });
  const apexTenant = await prisma.tenant.findUnique({ where: { code: "apex" } });

  if (!demoTenant) {
    console.error("Demo tenant not found");
    return;
  }

  await seedTestUsers({
    demo: demoTenant.id,
    apex: apexTenant?.id || "",
  });

  console.log("Successfully seeded test users with profiles and enrollments!");
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
