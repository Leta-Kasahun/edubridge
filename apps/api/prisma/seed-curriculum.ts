import { prisma, pool } from "../src/lib/prisma.js";
import { seedCurriculum } from "./seeds/curriculum.seeder.js";

async function main() {
  await seedCurriculum();
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
