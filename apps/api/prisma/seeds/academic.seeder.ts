import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";
import { hashPassword } from "../../src/shared/auth/password.js";
import { generateEthiopianAcademicYears } from "../../src/shared/utils/ethiopian-calendar.util.js";

interface SeedStudentData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  codeSuffix: string;
}

const GRADE_7_STUDENTS: SeedStudentData[] = [
  { firstName: "Abel", middleName: "Getachew", lastName: "Bekele", gender: "MALE", codeSuffix: "001" },
  { firstName: "Bethlehem", middleName: "Tadesse", lastName: "Mengistu", gender: "FEMALE", codeSuffix: "002" },
  { firstName: "Chala", middleName: "Dejene", lastName: "Tolessa", gender: "MALE", codeSuffix: "003" },
  { firstName: "Dagmawit", middleName: "Alemu", lastName: "Kassa", gender: "FEMALE", codeSuffix: "004" },
  { firstName: "Ermias", middleName: "Zewdu", lastName: "Hailu", gender: "MALE", codeSuffix: "005" },
  { firstName: "Fasika", middleName: "Berhanu", lastName: "Worku", gender: "FEMALE", codeSuffix: "006" },
  { firstName: "Girum", middleName: "Solomon", lastName: "Girma", gender: "MALE", codeSuffix: "007" },
  { firstName: "Hellen", middleName: "Fikru", lastName: "Kebede", gender: "FEMALE", codeSuffix: "008" },
  { firstName: "Ismael", middleName: "Mohammed", lastName: "Ahmed", gender: "MALE", codeSuffix: "009" },
  { firstName: "Jerusalem", middleName: "Kassahun", lastName: "Tesfaye", gender: "FEMALE", codeSuffix: "010" },
];

const GRADE_8_STUDENTS: SeedStudentData[] = [
  { firstName: "Kaleab", middleName: "Tilahun", lastName: "Mekonnen", gender: "MALE", codeSuffix: "011" },
  { firstName: "Lydia", middleName: "Yohannes", lastName: "Gidey", gender: "FEMALE", codeSuffix: "012" },
  { firstName: "Matiwos", middleName: "Baye", lastName: "Gobeze", gender: "MALE", codeSuffix: "013" },
  { firstName: "Nardos", middleName: "Habtamu", lastName: "Woldie", gender: "FEMALE", codeSuffix: "014" },
  { firstName: "Omer", middleName: "Kedir", lastName: "Hassen", gender: "MALE", codeSuffix: "015" },
  { firstName: "Rahel", middleName: "Mulugeta", lastName: "Assefa", gender: "FEMALE", codeSuffix: "016" },
  { firstName: "Samuel", middleName: "Negash", lastName: "Ayele", gender: "MALE", codeSuffix: "017" },
  { firstName: "Tigist", middleName: "Haile", lastName: "Girma", gender: "FEMALE", codeSuffix: "018" },
  { firstName: "Yared", middleName: "Desta", lastName: "Belay", gender: "MALE", codeSuffix: "019" },
  { firstName: "Zeineb", middleName: "Shifa", lastName: "Abdo", gender: "FEMALE", codeSuffix: "020" },
];

const GRADE_9_STUDENTS: SeedStudentData[] = [
  { firstName: "Abebe", middleName: "Kebede", lastName: "Tessema", gender: "MALE", codeSuffix: "021" },
  { firstName: "Almaz", middleName: "Haile", lastName: "Girma", gender: "FEMALE", codeSuffix: "022" },
  { firstName: "Dawit", middleName: "Mulugeta", lastName: "Assefa", gender: "MALE", codeSuffix: "023" },
  { firstName: "Emebet", middleName: "Shimelis", lastName: "Demisse", gender: "FEMALE", codeSuffix: "024" },
  { firstName: "Fitsum", middleName: "Tariku", lastName: "Bogale", gender: "MALE", codeSuffix: "025" },
  { firstName: "Genet", middleName: "Abera", lastName: "Wondimu", gender: "FEMALE", codeSuffix: "026" },
  { firstName: "Henok", middleName: "Tefera", lastName: "Mamo", gender: "MALE", codeSuffix: "027" },
  { firstName: "Kidist", middleName: "Endale", lastName: "Tadesse", gender: "FEMALE", codeSuffix: "028" },
  { firstName: "Leul", middleName: "Amare", lastName: "Fentaw", gender: "MALE", codeSuffix: "029" },
  { firstName: "Mahlet", middleName: "Sisay", lastName: "Gashaw", gender: "FEMALE", codeSuffix: "030" },
];

export async function seedAcademicStructureAndStudents(
  tenantId: string,
  tenantCode: string
) {
  return runWithoutTenant(async () => {
    await prisma.studentEnrollment.deleteMany({
      where: { tenantId },
    });

    await prisma.studentProfile.deleteMany({
      where: { tenantId },
    });

    await prisma.academicYear.deleteMany({
      where: {
        tenantId,
        code: {
          in: [
            "AY-2025-2026",
            "AY-2024-2025",
            `AY-2025-2026-${tenantCode}`,
            `AY-2024-2025-${tenantCode}`,
          ],
        },
      },
    });

    const generatedYears = generateEthiopianAcademicYears(2005, tenantCode);
    let currentAcademicYearRecord = null;

    for (const gy of generatedYears) {
      const record = await prisma.academicYear.upsert({
        where: {
          tenantId_code: {
            tenantId,
            code: gy.code,
          },
        },
        update: {
          name: gy.name,
          status: gy.status,
          startDate: gy.startDate,
          endDate: gy.endDate,
        },
        create: {
          tenantId,
          name: gy.name,
          code: gy.code,
          startDate: gy.startDate,
          endDate: gy.endDate,
          status: gy.status,
        },
      });

      if (gy.isCurrent) {
        currentAcademicYearRecord = record;
      }
    }

    const currentAcademicYear =
      currentAcademicYearRecord ||
      (await prisma.academicYear.findFirst({
        where: { tenantId, status: "ACTIVE" },
      }));

    if (!currentAcademicYear) {
      return;
    }

    await prisma.grade.updateMany({
      where: {
        tenantId,
        level: { notIn: [7, 8, 9] },
      },
      data: {
        isActive: false,
      },
    });

    const gradeConfigs = [
      { level: 7, students: GRADE_7_STUDENTS },
      { level: 8, students: GRADE_8_STUDENTS },
      { level: 9, students: GRADE_9_STUDENTS },
    ];

    const studentRole = await prisma.role.findFirst({
      where: {
        tenantId,
        code: "STUDENT",
      },
    });

    const defaultPasswordHash = await hashPassword("EduBridge2026!#");

    for (const gc of gradeConfigs) {
      const grade = await prisma.grade.upsert({
        where: {
          tenantId_level: {
            tenantId,
            level: gc.level,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          tenantId,
          level: gc.level,
          isActive: true,
        },
      });

      const sectionA = await prisma.section.upsert({
        where: {
          academicYearId_code: {
            academicYearId: currentAcademicYear.id,
            code: `G${gc.level}-A-${tenantCode}`,
          },
        },
        update: {
          name: "Section A",
          gradeId: grade.id,
          capacity: 40,
        },
        create: {
          tenantId,
          academicYearId: currentAcademicYear.id,
          gradeId: grade.id,
          name: "Section A",
          code: `G${gc.level}-A-${tenantCode}`,
          capacity: 40,
        },
      });

      const sectionB = await prisma.section.upsert({
        where: {
          academicYearId_code: {
            academicYearId: currentAcademicYear.id,
            code: `G${gc.level}-B-${tenantCode}`,
          },
        },
        update: {
          name: "Section B",
          gradeId: grade.id,
          capacity: 40,
        },
        create: {
          tenantId,
          academicYearId: currentAcademicYear.id,
          gradeId: grade.id,
          name: "Section B",
          code: `G${gc.level}-B-${tenantCode}`,
          capacity: 40,
        },
      });

      for (let i = 0; i < gc.students.length; i++) {
        const stu = gc.students[i];
        if (!stu) continue;

        const assignedSection = i < 5 ? sectionA : sectionB;
        const studentCode = `${tenantCode.toUpperCase()}-STU-${stu.codeSuffix}`;
        const username = `${stu.firstName.toLowerCase()}.${stu.middleName.toLowerCase()}.${tenantCode}`;
        const email = `${stu.firstName.toLowerCase()}.${stu.middleName.toLowerCase()}@student.${tenantCode}.edubridge.demo`;

        const user = await prisma.user.upsert({
          where: { username },
          update: {
            firstName: stu.firstName,
            lastName: stu.middleName,
            email,
          },
          create: {
            username,
            email,
            firstName: stu.firstName,
            lastName: stu.middleName,
            passwordHash: defaultPasswordHash,
            status: "PENDING_FIRST_LOGIN",
          },
        });

        const membership = await prisma.tenantMembership.upsert({
          where: {
            tenantId_userId: {
              tenantId,
              userId: user.id,
            },
          },
          update: { status: "ACTIVE" },
          create: {
            tenantId,
            userId: user.id,
            status: "ACTIVE",
          },
        });

        if (studentRole) {
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
        }

        const profile = await prisma.studentProfile.create({
          data: {
            tenantId,
            userId: user.id,
            studentCode,
            firstName: stu.firstName,
            middleName: stu.middleName,
            lastName: stu.lastName,
            gender: stu.gender,
          },
        });

        await prisma.studentEnrollment.create({
          data: {
            tenantId,
            studentId: profile.id,
            academicYearId: currentAcademicYear.id,
            sectionId: assignedSection.id,
            status: "ACTIVE",
          },
        });
      }
    }
  });
}
