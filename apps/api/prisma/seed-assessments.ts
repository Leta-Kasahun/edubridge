import { seedAssessments } from "./seeds/assessment.seeder.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("Seeding Grade 7 and Grade 8 mixed assessments...");
  await seedAssessments();
  console.log("Assessments seeded successfully!");
}

main()
  .catch((err) => {
    console.error("Failed to seed assessments:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
