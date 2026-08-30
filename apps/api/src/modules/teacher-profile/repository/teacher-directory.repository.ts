import { prisma } from "../../../lib/prisma.js";
import { Prisma, QualificationLevel } from "../../../generated/prisma/client.js";
import {
  TeacherDirectoryFilterParams,
  TeacherDirectoryResult,
  TeacherDirectoryItem,
} from "../types/teacher-directory.types.js";

const LEVEL_WEIGHTS: Record<QualificationLevel, number> = {
  DOCTORATE: 5,
  MASTER: 4,
  BACHELOR: 3,
  DIPLOMA: 2,
  CERTIFICATE: 1,
  OTHER: 0,
};

function calculateMonths(startDate: Date, endDate: Date | null): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

export class TeacherDirectoryRepository {
  async findDirectory(params: TeacherDirectoryFilterParams): Promise<TeacherDirectoryResult> {
    const {
      tenantId,
      search,
      level,
      hasCertificate,
      status,
      page = 1,
      limit = 50,
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.TeacherProfileWhereInput = {
      user: {
        status: {
          not: "PENDING_FIRST_LOGIN",
        },
      },
    };

    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    if (search && search.trim()) {
      const s = search.trim();
      where.OR = [
        { firstName: { contains: s, mode: "insensitive" } },
        { middleName: { contains: s, mode: "insensitive" } },
        { lastName: { contains: s, mode: "insensitive" } },
        { employeeCode: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        {
          qualifications: {
            some: {
              OR: [
                { fieldOfStudy: { contains: s, mode: "insensitive" } },
                { institution: { contains: s, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          experiences: {
            some: {
              OR: [
                { position: { contains: s, mode: "insensitive" } },
                { institution: { contains: s, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    if (level) {
      where.qualifications = {
        some: { level },
      };
    }

    if (hasCertificate !== undefined) {
      where.qualifications = {
        ...(where.qualifications || {}),
        some: hasCertificate
          ? { documentUrl: { not: null } }
          : { documentUrl: null },
      };
    }

    const [total, records] = await Promise.all([
      prisma.teacherProfile.count({ where }),
      prisma.teacherProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
            },
          },
          qualifications: {
            orderBy: [
              { graduationYear: "desc" },
              { startYear: "desc" },
              { createdAt: "desc" },
            ],
          },
          experiences: {
            orderBy: [
              { startDate: "desc" },
              { createdAt: "desc" },
            ],
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip,
        take: limit,
      }),
    ]);

    const items: TeacherDirectoryItem[] = records.map((t) => {
      const uniqueFields = Array.from(
        new Set(
          t.qualifications
            .map((q) => q.fieldOfStudy?.trim())
            .filter((f): f is string => Boolean(f))
        )
      );

      const certCount = t.qualifications.filter((q) => Boolean(q.documentUrl)).length;

      let highestLevel: QualificationLevel | null = null;
      let maxWeight = -1;
      for (const q of t.qualifications) {
        const weight = LEVEL_WEIGHTS[q.level] ?? -1;
        if (weight > maxWeight) {
          maxWeight = weight;
          highestLevel = q.level;
        }
      }

      const totalMonths = t.experiences.reduce(
        (acc, exp) => acc + calculateMonths(exp.startDate, exp.endDate),
        0
      );

      const latestExp = t.experiences[0];
      const latestPosition = latestExp
        ? latestExp.position
          ? `${latestExp.position} — ${latestExp.institution}`
          : latestExp.institution
        : null;

      return {
        id: t.id,
        tenantId: t.tenantId,
        userId: t.userId,
        employeeCode: t.employeeCode,
        firstName: t.firstName,
        middleName: t.middleName,
        lastName: t.lastName,
        fullName: `${t.firstName} ${t.middleName} ${t.lastName}`.trim(),
        email: t.email || t.user?.email || null,
        phoneNumber: t.phoneNumber,
        photoUrl: t.photoUrl,
        status: t.status,
        accountStatus: t.user?.status ?? null,
        fieldsOfStudy: uniqueFields,
        qualifications: t.qualifications.map((q) => ({
          id: q.id,
          level: q.level,
          fieldOfStudy: q.fieldOfStudy,
          institution: q.institution,
          startYear: q.startYear,
          graduationYear: q.graduationYear,
          documentUrl: q.documentUrl,
        })),
        experiences: t.experiences.map((e) => ({
          id: e.id,
          institution: e.institution,
          position: e.position,
          startDate: e.startDate,
          endDate: e.endDate,
        })),
        certificateCount: certCount,
        highestLevel,
        latestPosition,
        totalExperienceMonths: totalMonths,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: items,
    };
  }
}

export const teacherDirectoryRepository = new TeacherDirectoryRepository();
