import { prisma, pool } from "../src/lib/prisma.js";
import { seedSecurityPolicy } from "./seeds/security-policy.seeder.js";

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, code: true, name: true },
  });

  for (const tenant of tenants) {
    await seedSecurityPolicy(tenant.id);
  }

  await prisma.securityPolicy.updateMany({
    data: {
      accessTokenExpiryMinutes: 43200,
    },
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
