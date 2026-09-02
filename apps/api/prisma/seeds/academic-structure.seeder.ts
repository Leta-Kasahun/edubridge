import { prisma, runWithoutTenant } from "../../src/lib/prisma.js";
import { generateEthiopianAcademicYears } from "../../src/shared/utils/ethiopian-calendar.util.js";
import { ETHIOPIAN_STANDARD_SUBJECTS } from "../../src/shared/constants/subject.constants.js";

export async function seedAcademicStructure(targetTenantId?: string) {
  await runWithoutTenant(async () => {
    const subjectMap = new Map<string, string>();

    for (const sub of ETHIOPIAN_STANDARD_SUBJECTS) {
      const record = await prisma.subject.upsert({
        where: { code: sub.code },
        update: {
          name: sub.name,
          isActive: true,
        },
        create: {
          code: sub.code,
          name: sub.name,
          description: `Standard ${sub.name} curriculum (${sub.category})`,
          isActive: true,
        },
      });
      subjectMap.set(sub.code, record.id);
    }

    const whereClause = targetTenantId
      ? { id: targetTenantId, status: "ACTIVE" as const }
      : { status: "ACTIVE" as const };

    const tenants = await prisma.tenant.findMany({
      where: whereClause,
      select: { id: true, code: true, name: true },
    });

    for (const tenant of tenants) {
      const generatedYears = generateEthiopianAcademicYears(2010, tenant.code);
      const academicYearMap = new Map<string, string>();

      for (const gy of generatedYears) {
        const yearRecord = await prisma.academicYear.upsert({
          where: {
            tenantId_code: {
              tenantId: tenant.id,
              code: gy.code,
            },
          },
          update: {
            name: gy.name,
            startDate: gy.startDate,
            endDate: gy.endDate,
            status: gy.status,
          },
          create: {
            tenantId: tenant.id,
            name: gy.name,
            code: gy.code,
            startDate: gy.startDate,
            endDate: gy.endDate,
            status: gy.status,
          },
        });
        academicYearMap.set(gy.code, yearRecord.id);
      }

      const activeYearCode = generatedYears.find((y) => y.status === "ACTIVE")?.code;
      const activeYearId = activeYearCode ? academicYearMap.get(activeYearCode) : null;

      const gradeLevels = [7, 8, 9, 10, 11, 12];
      const gradeMap = new Map<number, string>();

      for (const level of gradeLevels) {
        const gradeRecord = await prisma.grade.upsert({
          where: {
            tenantId_level: {
              tenantId: tenant.id,
              level,
            },
          },
          update: {
            isActive: true,
          },
          create: {
            tenantId: tenant.id,
            level,
            isActive: true,
          },
        });
        gradeMap.set(level, gradeRecord.id);

        for (const sub of ETHIOPIAN_STANDARD_SUBJECTS) {
          if (sub.defaultGrades.includes(level)) {
            const subjectId = subjectMap.get(sub.code);
            if (subjectId) {
              await prisma.gradeSubject.upsert({
                where: {
                  gradeId_subjectId: {
                    gradeId: gradeRecord.id,
                    subjectId,
                  },
                },
                update: {},
                create: {
                  gradeId: gradeRecord.id,
                  subjectId,
                },
              });
            }
          }
        }
      }

      if (activeYearId) {
        const sectionConfig: Record<number, string[]> = {
          7: ["7-A", "7-B"],
          8: ["8-A", "8-B"],
          9: ["9-A", "9-B", "9-C"],
          10: ["10-A", "10-B", "10-C"],
          11: ["11-NAT-A", "11-SOC-A"],
          12: ["12-NAT-A", "12-SOC-A"],
        };

        for (const [lvlStr, secNames] of Object.entries(sectionConfig)) {
          const level = parseInt(lvlStr, 10);
          const gradeId = gradeMap.get(level);
          if (!gradeId) continue;

          for (const secName of secNames) {
            const secCode = `${tenant.code.toUpperCase()}-${secName.replace(/\s+/g, "-")}`;
            await prisma.section.upsert({
              where: {
                academicYearId_code: {
                  academicYearId: activeYearId,
                  code: secCode,
                },
              },
              update: {
                name: secName,
                gradeId,
                capacity: 45,
                tenantId: tenant.id,
              },
              create: {
                tenantId: tenant.id,
                academicYearId: activeYearId,
                gradeId,
                name: secName,
                code: secCode,
                capacity: 45,
              },
            });
          }
        }
      }
    }
  });
}
