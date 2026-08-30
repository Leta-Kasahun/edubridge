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

interface SeedTeacherData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  codeSuffix: string;
  emailPrefix: string;
  phoneNumber: string;
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

const TEACHERS_2017: SeedTeacherData[] = [
  { firstName: "Alemayehu", middleName: "Taye", lastName: "Kebede", gender: "MALE", codeSuffix: "101", emailPrefix: "alemayehu.taye", phoneNumber: "+251911101001" },
  { firstName: "Biruk", middleName: "Moges", lastName: "Teshome", gender: "MALE", codeSuffix: "102", emailPrefix: "biruk.moges", phoneNumber: "+251911101002" },
  { firstName: "Chaltu", middleName: "Gudina", lastName: "Tufa", gender: "FEMALE", codeSuffix: "103", emailPrefix: "chaltu.gudina", phoneNumber: "+251911101003" },
  { firstName: "Daniel", middleName: "Haile", lastName: "Desta", gender: "MALE", codeSuffix: "104", emailPrefix: "daniel.haile", phoneNumber: "+251911101004" },
  { firstName: "Eden", middleName: "Berhe", lastName: "Gebru", gender: "FEMALE", codeSuffix: "105", emailPrefix: "eden.berhe", phoneNumber: "+251911101005" },
  { firstName: "Fikadu", middleName: "Tesfaye", lastName: "Assefa", gender: "MALE", codeSuffix: "106", emailPrefix: "fikadu.tesfaye", phoneNumber: "+251911101006" },
  { firstName: "Genet", middleName: "Zelalem", lastName: "Mengistu", gender: "FEMALE", codeSuffix: "107", emailPrefix: "genet.zelalem", phoneNumber: "+251911101007" },
  { firstName: "Habtamu", middleName: "Kassa", lastName: "Woldie", gender: "MALE", codeSuffix: "108", emailPrefix: "habtamu.kassa", phoneNumber: "+251911101008" },
  { firstName: "Konjit", middleName: "Abebe", lastName: "Girma", gender: "FEMALE", codeSuffix: "109", emailPrefix: "konjit.abebe", phoneNumber: "+251911101009" },
  { firstName: "Lemma", middleName: "Megersa", lastName: "Tolessa", gender: "MALE", codeSuffix: "110", emailPrefix: "lemma.megersa", phoneNumber: "+251911101010" },
];

const TEACHERS_2018: SeedTeacherData[] = [
  { firstName: "Meseret", middleName: "Defar", lastName: "Tola", gender: "FEMALE", codeSuffix: "201", emailPrefix: "meseret.defar", phoneNumber: "+251911202001" },
  { firstName: "Nigist", middleName: "Wondimu", lastName: "Bekele", gender: "FEMALE", codeSuffix: "202", emailPrefix: "nigist.wondimu", phoneNumber: "+251911202002" },
  { firstName: "Paulos", middleName: "Girma", lastName: "Hailu", gender: "MALE", codeSuffix: "203", emailPrefix: "paulos.girma", phoneNumber: "+251911202003" },
  { firstName: "Rahel", middleName: "Samson", lastName: "Belay", gender: "FEMALE", codeSuffix: "204", emailPrefix: "rahel.samson", phoneNumber: "+251911202004" },
  { firstName: "Solomon", middleName: "Bogale", lastName: "Mamo", gender: "MALE", codeSuffix: "205", emailPrefix: "solomon.bogale", phoneNumber: "+251911202005" },
  { firstName: "Tewodros", middleName: "Kassahun", lastName: "Fentaw", gender: "MALE", codeSuffix: "206", emailPrefix: "tewodros.kassahun", phoneNumber: "+251911202006" },
  { firstName: "Wubet", middleName: "Shiferaw", lastName: "Demisse", gender: "FEMALE", codeSuffix: "207", emailPrefix: "wubet.shiferaw", phoneNumber: "+251911202007" },
  { firstName: "Yonas", middleName: "Bedada", lastName: "Worku", gender: "MALE", codeSuffix: "208", emailPrefix: "yonas.bedada", phoneNumber: "+251911202008" },
  { firstName: "Zinash", middleName: "Tayachew", lastName: "Alemu", gender: "FEMALE", codeSuffix: "209", emailPrefix: "zinash.tayachew", phoneNumber: "+251911202009" },
  { firstName: "Mulugeta", middleName: "Serbessa", lastName: "Gidey", gender: "MALE", codeSuffix: "210", emailPrefix: "mulugeta.serbessa", phoneNumber: "+251911202010" },
];

export async function seedAcademicStructureAndStudents(
  tenantId: string,
  tenantCode: string
) {
  return runWithoutTenant(async () => {
    await prisma.teacherAssignment.deleteMany({
      where: { tenantId },
    });

    await prisma.teacherProfile.deleteMany({
      where: { tenantId },
    });

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
    const academicYearMap = new Map<number, { id: string; name: string }>();

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

      academicYearMap.set(gy.year, record);

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

    const teacherRole = await prisma.role.findFirst({
      where: {
        tenantId,
        code: "TEACHER",
      },
    });

    const defaultPasswordHash = await hashPassword("EduBridge2026!#");

    const createdSections: { id: string; academicYearId: string }[] = [];

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

      for (const targetYear of [2017, 2018]) {
        const yearRecord = academicYearMap.get(targetYear) || currentAcademicYear;

        const sectionA = await prisma.section.upsert({
          where: {
            academicYearId_code: {
              academicYearId: yearRecord.id,
              code: `G${gc.level}-A-${targetYear}-${tenantCode}`,
            },
          },
          update: {
            name: "Section A",
            gradeId: grade.id,
            capacity: 40,
          },
          create: {
            tenantId,
            academicYearId: yearRecord.id,
            gradeId: grade.id,
            name: "Section A",
            code: `G${gc.level}-A-${targetYear}-${tenantCode}`,
            capacity: 40,
          },
        });

        const sectionB = await prisma.section.upsert({
          where: {
            academicYearId_code: {
              academicYearId: yearRecord.id,
              code: `G${gc.level}-B-${targetYear}-${tenantCode}`,
            },
          },
          update: {
            name: "Section B",
            gradeId: grade.id,
            capacity: 40,
          },
          create: {
            tenantId,
            academicYearId: yearRecord.id,
            gradeId: grade.id,
            name: "Section B",
            code: `G${gc.level}-B-${targetYear}-${tenantCode}`,
            capacity: 40,
          },
        });

        createdSections.push(
          { id: sectionA.id, academicYearId: yearRecord.id },
          { id: sectionB.id, academicYearId: yearRecord.id }
        );

        if (yearRecord.id === currentAcademicYear.id) {
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
      }
    }

    const teacherYearGroups = [
      { year: 2017, teachers: TEACHERS_2017 },
      { year: 2018, teachers: TEACHERS_2018 },
    ];

    for (const group of teacherYearGroups) {
      const yearRecord = academicYearMap.get(group.year) || currentAcademicYear;
      const yearSections = createdSections.filter(
        (s) => s.academicYearId === yearRecord.id
      );

      for (let i = 0; i < group.teachers.length; i++) {
        const t = group.teachers[i];
        if (!t) continue;

        const employeeCode = `${tenantCode.toUpperCase()}EMP${t.codeSuffix}`;
        const username = `${t.firstName.toLowerCase()}.${t.middleName.toLowerCase()}.${tenantCode}`;
        const email = `${t.emailPrefix}@teacher.${tenantCode}.edubridge.demo`;

        const user = await prisma.user.upsert({
          where: { username },
          update: {
            firstName: t.firstName,
            lastName: t.lastName,
            email,
            status: "PENDING_FIRST_LOGIN",
          },
          create: {
            username,
            email,
            firstName: t.firstName,
            lastName: t.lastName,
            passwordHash: defaultPasswordHash,
            status: "PENDING_FIRST_LOGIN",
            emailVerified: true,
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

        if (teacherRole) {
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
        }

        const profile = await prisma.teacherProfile.create({
          data: {
            tenantId,
            userId: user.id,
            employeeCode,
            firstName: t.firstName,
            middleName: t.middleName,
            lastName: t.lastName,
            gender: t.gender,
            email,
            phoneNumber: t.phoneNumber,
            status: "ACTIVE",
          },
        });

        const targetSection = yearSections[i % yearSections.length];
        if (targetSection) {
          await prisma.teacherAssignment.create({
            data: {
              tenantId,
              teacherId: profile.id,
              academicYearId: yearRecord.id,
              sectionId: targetSection.id,
              role: "HOMEROOM_TEACHER",
              status: "ACTIVE",
            },
          });
        }
      }
    }
  });
}
