import { prisma, pool, runWithoutTenant } from "../src/lib/prisma.js";
import { hashPassword } from "../src/shared/auth/password.js";
import { Gender, QualificationLevel } from "../src/generated/prisma/client.js";

interface TeacherSeedItem {
  readonly firstName: string;
  readonly middleName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly employeeCodeSuffix: string;
  readonly emailPrefix: string;
  readonly phoneNumber: string;
  readonly qualification: {
    readonly level: QualificationLevel;
    readonly fieldOfStudy: string;
    readonly institution: string;
    readonly startYear: number;
    readonly graduationYear: number;
    readonly documentUrl: string;
  };
  readonly experience: {
    readonly institution: string;
    readonly position: string;
    readonly startDate: Date;
    readonly endDate: Date;
  };
}

const ETHIOPIAN_TEACHERS: readonly TeacherSeedItem[] = [
  {
    firstName: "Abebe",
    middleName: "Bekele",
    lastName: "Tessema",
    gender: "MALE",
    employeeCodeSuffix: "101",
    emailPrefix: "abebe.bekele",
    phoneNumber: "+251911234501",
    qualification: {
      level: "MASTER",
      fieldOfStudy: "Mathematics Education",
      institution: "Addis Ababa University",
      startYear: 2017,
      graduationYear: 2019,
      documentUrl: "https://edubridge.et/docs/qualifications/abebe-msc.pdf",
    },
    experience: {
      institution: "Bole Senior Secondary School",
      position: "Senior Mathematics Teacher",
      startDate: new Date("2019-09-01"),
      endDate: new Date("2024-06-30"),
    },
  },
  {
    firstName: "Genet",
    middleName: "Hailemariam",
    lastName: "Mengistu",
    gender: "FEMALE",
    employeeCodeSuffix: "102",
    emailPrefix: "genet.hailemariam",
    phoneNumber: "+251911234502",
    qualification: {
      level: "MASTER",
      fieldOfStudy: "English Language Teaching",
      institution: "Hawassa University",
      startYear: 2016,
      graduationYear: 2018,
      documentUrl: "https://edubridge.et/docs/qualifications/genet-ma.pdf",
    },
    experience: {
      institution: "Hawassa Community School",
      position: "English Department Head",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2023-06-30"),
    },
  },
  {
    firstName: "Dawit",
    middleName: "Yohannes",
    lastName: "Girma",
    gender: "MALE",
    employeeCodeSuffix: "103",
    emailPrefix: "dawit.yohannes",
    phoneNumber: "+251911234503",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "Biological Sciences",
      institution: "Bahir Dar University",
      startYear: 2015,
      graduationYear: 2019,
      documentUrl: "https://edubridge.et/docs/qualifications/dawit-bsc.pdf",
    },
    experience: {
      institution: "Tana Secondary School",
      position: "Biology Teacher",
      startDate: new Date("2019-10-01"),
      endDate: new Date("2024-06-30"),
    },
  },
  {
    firstName: "Tigist",
    middleName: "Alemayehu",
    lastName: "Kassa",
    gender: "FEMALE",
    employeeCodeSuffix: "104",
    emailPrefix: "tigist.alemayehu",
    phoneNumber: "+251911234504",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "Applied Chemistry",
      institution: "Jimma University",
      startYear: 2016,
      graduationYear: 2020,
      documentUrl: "https://edubridge.et/docs/qualifications/tigist-bsc.pdf",
    },
    experience: {
      institution: "Jimma Model School",
      position: "Chemistry Laboratory Instructor",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2024-06-30"),
    },
  },
  {
    firstName: "Ermias",
    middleName: "Solomon",
    lastName: "Worku",
    gender: "MALE",
    employeeCodeSuffix: "105",
    emailPrefix: "ermias.solomon",
    phoneNumber: "+251911234505",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "History and Heritage Management",
      institution: "University of Gondar",
      startYear: 2014,
      graduationYear: 2018,
      documentUrl: "https://edubridge.et/docs/qualifications/ermias-ba.pdf",
    },
    experience: {
      institution: "Fasiledes Secondary School",
      position: "History Teacher",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2023-06-30"),
    },
  },
  {
    firstName: "Bethlehem",
    middleName: "Tadesse",
    lastName: "Hailu",
    gender: "FEMALE",
    employeeCodeSuffix: "106",
    emailPrefix: "bethlehem.tadesse",
    phoneNumber: "+251911234506",
    qualification: {
      level: "MASTER",
      fieldOfStudy: "Geography and Environmental Studies",
      institution: "Addis Ababa University",
      startYear: 2017,
      graduationYear: 2019,
      documentUrl: "https://edubridge.et/docs/qualifications/bethlehem-ma.pdf",
    },
    experience: {
      institution: "Menelik II Secondary School",
      position: "Geography Teacher",
      startDate: new Date("2019-09-01"),
      endDate: new Date("2024-06-30"),
    },
  },
  {
    firstName: "Samuel",
    middleName: "Negash",
    lastName: "Ayele",
    gender: "MALE",
    employeeCodeSuffix: "107",
    emailPrefix: "samuel.negash",
    phoneNumber: "+251911234507",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "Civics and Ethical Studies",
      institution: "Arba Minch University",
      startYear: 2015,
      graduationYear: 2019,
      documentUrl: "https://edubridge.et/docs/qualifications/samuel-ba.pdf",
    },
    experience: {
      institution: "Nech Sar Academy",
      position: "Citizenship Education Teacher",
      startDate: new Date("2019-09-01"),
      endDate: new Date("2023-06-30"),
    },
  },
  {
    firstName: "Rahel",
    middleName: "Berhanu",
    lastName: "Desta",
    gender: "FEMALE",
    employeeCodeSuffix: "108",
    emailPrefix: "rahel.berhanu",
    phoneNumber: "+251911234508",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "General Science Education",
      institution: "Dire Dawa University",
      startYear: 2017,
      graduationYear: 2021,
      documentUrl: "https://edubridge.et/docs/qualifications/rahel-bsc.pdf",
    },
    experience: {
      institution: "Sabian Secondary School",
      position: "General Science Teacher",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2024-06-30"),
    },
  },
  {
    firstName: "Yonas",
    middleName: "Bedada",
    lastName: "Tolessa",
    gender: "MALE",
    employeeCodeSuffix: "109",
    emailPrefix: "yonas.bedada",
    phoneNumber: "+251911234509",
    qualification: {
      level: "MASTER",
      fieldOfStudy: "Economics and Development",
      institution: "Haramaya University",
      startYear: 2016,
      graduationYear: 2018,
      documentUrl: "https://edubridge.et/docs/qualifications/yonas-msc.pdf",
    },
    experience: {
      institution: "Harar Secondary School",
      position: "Economics Lecturer / Teacher",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2023-06-30"),
    },
  },
  {
    firstName: "Chaltu",
    middleName: "Gudina",
    lastName: "Mamo",
    gender: "FEMALE",
    employeeCodeSuffix: "110",
    emailPrefix: "chaltu.gudina",
    phoneNumber: "+251911234510",
    qualification: {
      level: "BACHELOR",
      fieldOfStudy: "Physics Education",
      institution: "Adama Science and Technology University",
      startYear: 2016,
      graduationYear: 2020,
      documentUrl: "https://edubridge.et/docs/qualifications/chaltu-bsc.pdf",
    },
    experience: {
      institution: "Adama Model Secondary School",
      position: "Physics Instructor",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2024-06-30"),
    },
  },
];

async function seedTeachers() {
  console.log("🇪🇹 Starting Ethiopian teachers seeding...");

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
      console.log(`\n🏫 Seeding 10 teachers for tenant: ${tenant.name} (${tenant.code})`);

      let teacherRole = await prisma.role.findFirst({
        where: {
          tenantId: tenant.id,
          code: "TEACHER",
        },
      });

      if (!teacherRole) {
        teacherRole = await prisma.role.create({
          data: {
            tenantId: tenant.id,
            name: "Teacher",
            code: "TEACHER",
            isSystem: true,
            isActive: true,
          },
        });
      }

      for (const item of ETHIOPIAN_TEACHERS) {
        const employeeCode = `${tenant.code.toUpperCase()}EMP${item.employeeCodeSuffix}`;
        const username = `${item.firstName.toLowerCase()}.${item.middleName.toLowerCase()}.${tenant.code}`;
        const email = `${item.emailPrefix}@teacher.${tenant.code}.edubridge.et`;

        const user = await prisma.user.upsert({
          where: { username },
          update: {
            firstName: item.firstName,
            lastName: item.lastName,
            email,
            status: "ACTIVE",
            emailVerified: true,
          },
          create: {
            username,
            email,
            firstName: item.firstName,
            lastName: item.lastName,
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
              roleId: teacherRole.id,
            },
          },
          update: {},
          create: {
            membershipId: membership.id,
            roleId: teacherRole.id,
          },
        });

        let profile = await prisma.teacherProfile.findFirst({
          where: {
            tenantId: tenant.id,
            employeeCode,
          },
        });

        if (profile) {
          profile = await prisma.teacherProfile.update({
            where: { id: profile.id },
            data: {
              userId: user.id,
              firstName: item.firstName,
              middleName: item.middleName,
              lastName: item.lastName,
              gender: item.gender,
              email,
              phoneNumber: item.phoneNumber,
              nationality: "Ethiopian",
              status: "ACTIVE",
            },
          });
        } else {
          profile = await prisma.teacherProfile.create({
            data: {
              tenantId: tenant.id,
              userId: user.id,
              employeeCode,
              firstName: item.firstName,
              middleName: item.middleName,
              lastName: item.lastName,
              gender: item.gender,
              email,
              phoneNumber: item.phoneNumber,
              nationality: "Ethiopian",
              status: "ACTIVE",
            },
          });
        }

        await prisma.teacherQualification.deleteMany({
          where: { teacherId: profile.id },
        });

        await prisma.teacherQualification.create({
          data: {
            tenantId: tenant.id,
            teacherId: profile.id,
            level: item.qualification.level,
            fieldOfStudy: item.qualification.fieldOfStudy,
            institution: item.qualification.institution,
            startYear: item.qualification.startYear,
            graduationYear: item.qualification.graduationYear,
            documentUrl: item.qualification.documentUrl,
          },
        });

        await prisma.teacherExperience.deleteMany({
          where: { teacherId: profile.id },
        });

        await prisma.teacherExperience.create({
          data: {
            tenantId: tenant.id,
            teacherId: profile.id,
            institution: item.experience.institution,
            position: item.experience.position,
            startDate: item.experience.startDate,
            endDate: item.experience.endDate,
          },
        });

        console.log(`   ✅ Seeded teacher: ${item.firstName} ${item.middleName} ${item.lastName} (${employeeCode})`);
      }
    }

    console.log("\n🎉 Successfully seeded 10 active Ethiopian teachers with full qualifications & experience!");
  });
}

seedTeachers()
  .catch((e) => {
    console.error("❌ Teacher seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
