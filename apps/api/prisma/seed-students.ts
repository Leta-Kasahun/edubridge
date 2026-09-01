import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";
import { hashPassword } from "../src/shared/auth/password.js";
import { Gender, ContactRelationship } from "../src/generated/prisma/client.js";

const MALE_FIRST_NAMES = [
  "Abel", "Biruk", "Dawit", "Eyob", "Fitsum", "Girma", "Henok", "Kalid",
  "Leul", "Mikiyas", "Nahom", "Robel", "Samuel", "Tariku", "Yared",
  "Yonatan", "Aman", "Biniam", "Daniel", "Ermias", "Natnael", "Surafel",
  "Temesgen", "Yohannes", "Zelalem", "Abinet", "Belete", "Desta", "Ephrem", "Fikadu"
];

const FEMALE_FIRST_NAMES = [
  "Almaz", "Bethlehem", "Blen", "Chaltu", "Dagmawit", "Eden", "Feven",
  "Genet", "Hana", "Helen", "Kalkidan", "Liya", "Mahlet", "Meron",
  "Nardos", "Rahel", "Ruth", "Samrawit", "Selamawit", "Tigist",
  "Tsion", "Yordanos", "Zeritu", "Aster", "Birtukan", "Derartu",
  "Eyerusalem", "Fasika", "Hiwot", "Meseret"
];

const FATHER_NAMES = [
  "Bekele", "Tadesse", "Haile", "Mulugeta", "Solomon", "Assefa", "Kebede",
  "Berhanu", "Desta", "Negash", "Girma", "Worku", "Mengistu", "Belay",
  "Yohannes", "Tesfaye", "Kassa", "Ayele", "Tolessa", "Gudina",
  "Abraham", "Daniel", "Getachew", "Melaku", "Sisay"
];

const GRANDFATHER_NAMES = [
  "Tessema", "Hailu", "Wolde", "Alemayehu", "Gebre", "Tekle", "Demissie",
  "Zewde", "Wondimu", "Mekonnen", "Woldemariam", "Tefera", "Lemma",
  "Bedada", "Mamo", "Hailemariam", "Gebremariam", "Fekadu", "Kassahun", "Beyene"
];

async function seedStudents() {
  console.log("🇪🇹 Seeding 5 Active Students per Section for all tenants in Ethiopian Standards...");

  await runWithoutTenant(async () => {
    const tenants = await prisma.tenant.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, code: true, name: true },
    });

    if (tenants.length === 0) {
      console.error("❌ No active tenants found in database.");
      return;
    }

    const defaultPasswordHash = await hashPassword("EduBridge2026!#");

    for (const tenant of tenants) {
      console.log(`\n========================================`);
      console.log(`🏫 Seeding Students for Tenant: ${tenant.name} (${tenant.code})`);
      console.log(`========================================`);

      let studentRole = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          code: "STUDENT",
        },
      });

      if (!studentRole) {
        studentRole = await prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: "Student",
            code: "STUDENT",
            isSystem: true,
            isActive: true,
          },
        });
      }

      const activeYear = await prisma.academicYear.findFirst({
        where: {
          tenantId: tenant.id,
          status: "ACTIVE",
        },
      });

      if (!activeYear) {
        console.warn(`⚠️  No active academic year found for tenant ${tenant.code}. Skipping student seeding.`);
        continue;
      }

      const sections = await prisma.section.findMany({
        where: {
          tenantId: tenant.id,
          academicYearId: activeYear.id,
        },
        include: {
          grade: true,
        },
        orderBy: [
          { grade: { level: "asc" } },
          { name: "asc" },
        ],
      });

      if (sections.length === 0) {
        console.warn(`⚠️  No sections found for active year in tenant ${tenant.code}. Skipping.`);
        continue;
      }

      console.log(`Found ${sections.length} active class section(s). Seeding 5 students each...`);

      let studentIndex = 1;

      for (const section of sections) {
        console.log(`   📚 Section: ${section.name} (Grade ${section.grade.level})`);

        for (let i = 1; i <= 5; i++) {
          const isFemale = (studentIndex % 2) === 0;
          const gender: Gender = isFemale ? "FEMALE" : "MALE";
          const firstNamesPool = isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES;

          const firstName = firstNamesPool[(studentIndex + i * 3) % firstNamesPool.length];
          const middleName = FATHER_NAMES[(studentIndex + i * 5) % FATHER_NAMES.length];
          const lastName = GRANDFATHER_NAMES[(studentIndex + i * 7) % GRANDFATHER_NAMES.length];

          const studentCodeSuffix = String(studentIndex).padStart(4, "0");
          const studentCode = `${tenant.code.toUpperCase()}STU${studentCodeSuffix}`;
          const username = `${firstName.toLowerCase()}.${middleName.toLowerCase()}.${tenant.code.toLowerCase()}${i}`;
          const email = `${firstName.toLowerCase()}.${middleName.toLowerCase()}.${studentCodeSuffix}@student.${tenant.code.toLowerCase()}.edubridge.et`;
          const phoneNumber = `+2519${String(10000000 + studentIndex).slice(0, 8)}`;
          const guardianPhone = `+2519${String(20000000 + studentIndex).slice(0, 8)}`;

          const birthYear = 2026 - (6 + section.grade.level);
          const dateOfBirth = new Date(`${birthYear}-04-15`);

          const user = await prisma.user.upsert({
            where: { username },
            update: {
              firstName,
              lastName,
              email,
              status: "ACTIVE",
              emailVerified: true,
            },
            create: {
              username,
              email,
              firstName,
              lastName,
              passwordHash: defaultPasswordHash,
              status: "ACTIVE",
              emailVerified: true,
            },
          });

          const membership = await prisma.tenantMembership.upsert({
            where: {
              tenantId_userId: {
                tenantId: tenant.id,
                userId: user.id,
              },
            },
            update: { status: "ACTIVE" },
            create: {
              tenantId: tenant.id,
              userId: user.id,
              status: "ACTIVE",
            },
          });

          await prisma.membershipRole.upsert({
            where: {
              membershipId_roleId: {
                membershipId: membership.id,
                roleId: studentRole.id,
              },
            },
            update: {},
            create: {
              membershipId: membership.id,
              roleId: studentRole.id,
            },
          });

          let profile = await prisma.studentProfile.findFirst({
            where: {
              tenantId: tenant.id,
              studentCode,
            },
          });

          if (profile) {
            profile = await prisma.studentProfile.update({
              where: { id: profile.id },
              data: {
                userId: user.id,
                firstName,
                middleName,
                lastName,
                gender,
                dateOfBirth,
                nationality: "Ethiopian",
                status: "ACTIVE",
              },
            });
          } else {
            profile = await prisma.studentProfile.create({
              data: {
                tenantId: tenant.id,
                userId: user.id,
                studentCode,
                firstName,
                middleName,
                lastName,
                gender,
                dateOfBirth,
                nationality: "Ethiopian",
                status: "ACTIVE",
              },
            });
          }

          const contact = await prisma.contact.create({
            data: {
              fullName: `${middleName} ${lastName}`,
              relationship: isFemale ? "FATHER" : "GUARDIAN",
              phoneNumber: guardianPhone,
            },
          });

          await prisma.studentContact.deleteMany({
            where: { studentId: profile.id },
          });

          await prisma.studentContact.create({
            data: {
              studentId: profile.id,
              contactId: contact.id,
              isPrimary: true,
              isEmergencyContact: true,
            },
          });

          await prisma.studentEnrollment.upsert({
            where: {
              studentId_academicYearId: {
                studentId: profile.id,
                academicYearId: activeYear.id,
              },
            },
            update: {
              sectionId: section.id,
              status: "ACTIVE",
            },
            create: {
              tenantId: tenant.id,
              studentId: profile.id,
              academicYearId: activeYear.id,
              sectionId: section.id,
              status: "ACTIVE",
            },
          });

          studentIndex++;
        }
      }

      console.log(`   ✅ Seeded ${studentIndex - 1} students across all sections in tenant ${tenant.code}.`);
    }

    console.log("\n🎉 Successfully seeded 5 active Ethiopian students per section with complete profiles & enrollments!");
  });
}

seedStudents()
  .catch((e) => {
    console.error("❌ Student seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
