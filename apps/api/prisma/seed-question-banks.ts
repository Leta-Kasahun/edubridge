import { prisma, pool } from "../src/lib/prisma.js";
import { seedQuestionBanksAndContexts } from "./seeds/question-bank.seeder.js";

async function main() {
  await seedQuestionBanksAndContexts();
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
