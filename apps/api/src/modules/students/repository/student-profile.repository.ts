import { prisma, ExtendedPrismaClient } from "../../../lib/prisma.js";
import {
  calculateAge,
  formatFullAddress,
  normalizeEthiopianPhone,
  validateAddressHierarchy,
  parseDate,
} from "../../../shared/utils/index.js";
import {
  CompleteStudentProfilePayload,
  UpdateStudentProfilePayload,
  StudentProfileDetail,
  StudentContactData,
  AddressData,
} from "../types/student-profile.types.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateLocationCode(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 15);
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix || "LOC"}_${suffix}`;
}

async function resolveOrCreateRegion(value: string | null | undefined): Promise<string | null> {
  if (!value?.trim()) return null;
  const name = value.trim();
  if (UUID_PATTERN.test(name)) {
    const existing = await prisma.region.findUnique({ where: { id: name } });
    if (existing) return existing.id;
  }
  const found = await prisma.region.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (found) return found.id;
  const created = await prisma.region.create({
    data: { name, code: generateLocationCode(name) },
  });
  return created.id;
}

async function resolveOrCreateZone(
  value: string | null | undefined,
  regionId: string | null
): Promise<string | null> {
  if (!value?.trim()) return null;
  const name = value.trim();
  if (UUID_PATTERN.test(name)) {
    const existing = await prisma.zone.findUnique({ where: { id: name } });
    if (existing) return existing.id;
  }
  if (regionId) {
    const found = await prisma.zone.findFirst({
      where: { regionId, name: { equals: name, mode: "insensitive" } },
    });
    if (found) return found.id;
    const created = await prisma.zone.create({
      data: { regionId, name, code: generateLocationCode(name) },
    });
    return created.id;
  }
  const found = await prisma.zone.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  return found?.id ?? null;
}

async function resolveOrCreateWoreda(
  value: string | null | undefined,
  zoneId: string | null
): Promise<string | null> {
  if (!value?.trim()) return null;
  const name = value.trim();
  if (UUID_PATTERN.test(name)) {
    const existing = await prisma.woreda.findUnique({ where: { id: name } });
    if (existing) return existing.id;
  }
  if (zoneId) {
    const found = await prisma.woreda.findFirst({
      where: { zoneId, name: { equals: name, mode: "insensitive" } },
    });
    if (found) return found.id;
    const created = await prisma.woreda.create({
      data: { zoneId, name, code: generateLocationCode(name) },
    });
    return created.id;
  }
  const found = await prisma.woreda.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  return found?.id ?? null;
}

async function resolveOrCreateKebele(
  value: string | null | undefined,
  woredaId: string | null
): Promise<string | null> {
  if (!value?.trim()) return null;
  const name = value.trim();
  if (UUID_PATTERN.test(name)) {
    const existing = await prisma.kebele.findUnique({ where: { id: name } });
    if (existing) return existing.id;
  }
  if (woredaId) {
    const found = await prisma.kebele.findFirst({
      where: { woredaId, name: { equals: name, mode: "insensitive" } },
    });
    if (found) return found.id;
    const created = await prisma.kebele.create({
      data: { woredaId, name, code: generateLocationCode(name) },
    });
    return created.id;
  }
  const found = await prisma.kebele.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  return found?.id ?? null;
}

async function resolveOrCreateCity(
  value: string | null | undefined,
  regionId: string | null
): Promise<string | null> {
  if (!value?.trim()) return null;
  const name = value.trim();
  if (UUID_PATTERN.test(name)) {
    const existing = await prisma.city.findUnique({ where: { id: name } });
    if (existing) return existing.id;
  }
  const found = await prisma.city.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (found) return found.id;
  const created = await prisma.city.create({
    data: { name, code: generateLocationCode(name), regionId: regionId ?? null },
  });
  return created.id;
}

const STUDENT_PROFILE_INCLUDE = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      emailVerified: true,
    },
  },
  address: {
    include: {
      region: { select: { id: true, name: true } },
      zone: { select: { id: true, name: true } },
      woreda: { select: { id: true, name: true } },
      kebele: { select: { id: true, name: true } },
      city: { select: { id: true, name: true } },
    },
  },
  contacts: {
    include: {
      contact: {
        include: {
          address: {
            include: {
              region: { select: { id: true, name: true } },
              zone: { select: { id: true, name: true } },
              woreda: { select: { id: true, name: true } },
              kebele: { select: { id: true, name: true } },
              city: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
  enrollments: {
    where: { status: "ACTIVE" as const },
    include: {
      academicYear: { select: { id: true, name: true } },
      section: {
        include: {
          grade: { select: { id: true, level: true } },
        },
      },
    },
    take: 1,
  },
} as const;

type StudentProfileRecord = NonNullable<Awaited<ReturnType<ExtendedPrismaClient["studentProfile"]["findFirst"]>> & {
  user?: {
    id: string;
    username: string | null;
    email: string | null;
    status: import("../../../generated/prisma/client.js").AccountStatus;
    emailVerified: boolean;
  } | null;
  address?: {
    id: string;
    regionId: string | null;
    zoneId: string | null;
    woredaId: string | null;
    kebeleId: string | null;
    cityId: string | null;
    specificLocation: string | null;
    region?: { id: string; name: string } | null;
    zone?: { id: string; name: string } | null;
    woreda?: { id: string; name: string } | null;
    kebele?: { id: string; name: string } | null;
    city?: { id: string; name: string } | null;
  } | null;
  contacts?: Array<{
    id: string;
    studentId: string;
    contactId: string;
    isPrimary: boolean;
    isEmergencyContact: boolean;
    contact: {
      id: string;
      fullName: string;
      relationship: import("../../../generated/prisma/client.js").ContactRelationship;
      phoneNumber: string;
      alternativePhoneNumber: string | null;
      address?: {
        id: string;
        regionId: string | null;
        zoneId: string | null;
        woredaId: string | null;
        kebeleId: string | null;
        cityId: string | null;
        specificLocation: string | null;
        region?: { id: string; name: string } | null;
        zone?: { id: string; name: string } | null;
        woreda?: { id: string; name: string } | null;
        kebele?: { id: string; name: string } | null;
        city?: { id: string; name: string } | null;
      } | null;
    };
  }>;
  enrollments?: Array<{
    id: string;
    academicYearId: string;
    academicYear: { id: string; name: string };
    section: {
      id: string;
      name: string;
      grade: { id: string; level: number };
    };
    status: string;
  }>;
}>;

function mapToStudentProfileDetail(profile: StudentProfileRecord): StudentProfileDetail {
  const addr = profile.address;
  const formattedAddress = addr
    ? formatFullAddress({
        regionName: addr.region?.name,
        zoneName: addr.zone?.name,
        woredaName: addr.woreda?.name,
        kebeleName: addr.kebele?.name,
        cityName: addr.city?.name,
        specificLocation: addr.specificLocation,
      })
    : undefined;

  const contacts = (profile.contacts || []).map((sc) => {
    const cAddr = sc.contact.address;
    const cFormattedAddress = cAddr
      ? formatFullAddress({
          regionName: cAddr.region?.name,
          zoneName: cAddr.zone?.name,
          woredaName: cAddr.woreda?.name,
          kebeleName: cAddr.kebele?.name,
          cityName: cAddr.city?.name,
          specificLocation: cAddr.specificLocation,
        })
      : undefined;

    return {
      id: sc.id,
      contactId: sc.contact.id,
      fullName: sc.contact.fullName,
      relationship: sc.contact.relationship,
      phoneNumber: sc.contact.phoneNumber,
      alternativePhoneNumber: sc.contact.alternativePhoneNumber,
      isPrimary: sc.isPrimary,
      isEmergencyContact: sc.isEmergencyContact,
      address: cAddr
        ? {
            id: cAddr.id,
            regionId: cAddr.regionId,
            zoneId: cAddr.zoneId,
            woredaId: cAddr.woredaId,
            kebeleId: cAddr.kebeleId,
            cityId: cAddr.cityId,
            specificLocation: cAddr.specificLocation,
            regionName: cAddr.region?.name,
            zoneName: cAddr.zone?.name,
            woredaName: cAddr.woreda?.name,
            kebeleName: cAddr.kebele?.name,
            cityName: cAddr.city?.name,
            formattedAddress: cFormattedAddress,
          }
        : null,
    };
  });

  const activeEnrollment = profile.enrollments?.[0];
  const enrollmentDetail = activeEnrollment
    ? {
        id: activeEnrollment.id,
        academicYearId: activeEnrollment.academicYearId,
        academicYearName: activeEnrollment.academicYear.name,
        gradeLevel: activeEnrollment.section.grade.level,
        sectionId: activeEnrollment.section.id,
        sectionName: activeEnrollment.section.name,
        status: activeEnrollment.status,
      }
    : null;

  const lastName = profile.lastName || profile.middleName;
  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return {
    id: profile.id,
    tenantId: profile.tenantId,
    userId: profile.userId,
    studentCode: profile.studentCode,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    fullName: fullName || `${profile.firstName} ${lastName}`,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth,
    age: calculateAge(profile.dateOfBirth),
    nationality: profile.nationality,
    photoUrl: profile.photoUrl,
    status: profile.status,
    accountStatus: profile.user?.status ?? null,
    username: profile.user?.username ?? null,
    email: profile.user?.email ?? null,
    address: addr
      ? {
          id: addr.id,
          regionId: addr.regionId,
          zoneId: addr.zoneId,
          woredaId: addr.woredaId,
          kebeleId: addr.kebeleId,
          cityId: addr.cityId,
          specificLocation: addr.specificLocation,
          regionName: addr.region?.name,
          zoneName: addr.zone?.name,
          woredaName: addr.woreda?.name,
          kebeleName: addr.kebele?.name,
          cityName: addr.city?.name,
          formattedAddress,
        }
      : null,
    contacts,
    enrollment: enrollmentDetail,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export class StudentProfileRepository {
  async findByUserId(userId: string, tenantId?: string): Promise<StudentProfileDetail | null> {
    const whereClause: { userId: string; tenantId?: string } = { userId };
    if (tenantId) whereClause.tenantId = tenantId;

    const profile = await prisma.studentProfile.findFirst({
      where: whereClause,
      include: STUDENT_PROFILE_INCLUDE,
    });

    if (!profile) return null;
    return mapToStudentProfileDetail(profile as unknown as StudentProfileRecord);
  }

  async findById(id: string, tenantId?: string): Promise<StudentProfileDetail | null> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const profile = await prisma.studentProfile.findFirst({
      where: whereClause,
      include: STUDENT_PROFILE_INCLUDE,
    });

    if (!profile) return null;
    return mapToStudentProfileDetail(profile as unknown as StudentProfileRecord);
  }

  async upsertAddress(
    existingAddressId: string | null | undefined,
    data: AddressData
  ): Promise<string> {
    const validation = validateAddressHierarchy(data);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid address hierarchy");
    }

    const regionId = await resolveOrCreateRegion(data.regionId);
    const zoneId = await resolveOrCreateZone(data.zoneId, regionId);
    const woredaId = await resolveOrCreateWoreda(data.woredaId, zoneId);
    const kebeleId = await resolveOrCreateKebele(data.kebeleId, woredaId);
    const cityId = await resolveOrCreateCity(data.cityId, regionId);

    const addressPayload = {
      regionId,
      zoneId,
      woredaId,
      cityId,
      kebeleId,
      subCityId: null,
      specificLocation: data.specificLocation?.trim() || null,
    };

    if (existingAddressId) {
      const updated = await prisma.address.update({
        where: { id: existingAddressId },
        data: addressPayload,
      });
      return updated.id;
    }

    const created = await prisma.address.create({
      data: addressPayload,
    });
    return created.id;
  }

  async syncContacts(
    studentProfileId: string,
    contacts: readonly StudentContactData[]
  ): Promise<void> {
    await prisma.studentContact.deleteMany({
      where: { studentId: studentProfileId },
    });

    for (const c of contacts) {
      const normalizedPhone = normalizeEthiopianPhone(c.phoneNumber) || c.phoneNumber.trim();
      const normalizedAltPhone = c.alternativePhoneNumber
        ? normalizeEthiopianPhone(c.alternativePhoneNumber)
        : null;

      let contactAddressId: string | null = null;
      if (c.address) {
        contactAddressId = await this.upsertAddress(null, c.address);
      }

      const createdContact = await prisma.contact.create({
        data: {
          fullName: c.fullName.trim(),
          relationship: c.relationship,
          phoneNumber: normalizedPhone,
          alternativePhoneNumber: normalizedAltPhone,
          addressId: contactAddressId,
        },
      });

      await prisma.studentContact.create({
        data: {
          studentId: studentProfileId,
          contactId: createdContact.id,
          isPrimary: c.isPrimary ?? true,
          isEmergencyContact: c.isEmergencyContact ?? false,
        },
      });
    }
  }

  async completeProfile(
    profileId: string,
    payload: CompleteStudentProfilePayload,
    addressId?: string | null,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
    const parsedDob = parseDate(payload.dateOfBirth) || payload.dateOfBirth;

    return prisma.$transaction(async (tx) => {
      const whereClause: { id: string; tenantId?: string } = { id: profileId };
      if (tenantId) whereClause.tenantId = tenantId;

      const updatedProfile = await tx.studentProfile.update({
        where: whereClause,
        data: {
          firstName: payload.firstName,
          middleName: payload.middleName,
          lastName: payload.lastName || null,
          gender: payload.gender,
          dateOfBirth: parsedDob,
          nationality: payload.nationality || null,
          photoUrl: payload.photoUrl || null,
          addressId: addressId ?? undefined,
        },
        include: STUDENT_PROFILE_INCLUDE,
      });

      if (updatedProfile.userId) {
        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName || payload.middleName,
            status: "ACTIVE",
          },
        });
      }

      if (payload.contacts && payload.contacts.length > 0) {
        await this.syncContacts(profileId, payload.contacts);
      }

      const refreshed = await tx.studentProfile.findFirst({
        where: whereClause,
        include: STUDENT_PROFILE_INCLUDE,
      });

      return mapToStudentProfileDetail((refreshed || updatedProfile) as unknown as StudentProfileRecord);
    });
  }

  async updateProfile(
    profileId: string,
    payload: UpdateStudentProfilePayload,
    addressId?: string | null,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
    const updateData: Record<string, unknown> = {};

    if (payload.firstName !== undefined) updateData.firstName = payload.firstName;
    if (payload.middleName !== undefined) updateData.middleName = payload.middleName;
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName || null;
    if (payload.gender !== undefined) updateData.gender = payload.gender;
    if (payload.dateOfBirth !== undefined) {
      updateData.dateOfBirth = payload.dateOfBirth ? parseDate(payload.dateOfBirth) : null;
    }
    if (payload.nationality !== undefined) updateData.nationality = payload.nationality || null;
    if (payload.photoUrl !== undefined) updateData.photoUrl = payload.photoUrl || null;
    if (addressId !== undefined) updateData.addressId = addressId;

    return prisma.$transaction(async (tx) => {
      const whereClause: { id: string; tenantId?: string } = { id: profileId };
      if (tenantId) whereClause.tenantId = tenantId;

      const updatedProfile = await tx.studentProfile.update({
        where: whereClause,
        data: updateData,
        include: STUDENT_PROFILE_INCLUDE,
      });

      if (updatedProfile.userId && (payload.firstName || payload.lastName || payload.middleName)) {
        const userUpdate: Record<string, unknown> = {};
        if (payload.firstName) userUpdate.firstName = payload.firstName;
        if (payload.lastName || payload.middleName) {
          userUpdate.lastName = payload.lastName || payload.middleName;
        }

        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: userUpdate,
        });
      }

      if (payload.contacts !== undefined) {
        await this.syncContacts(profileId, payload.contacts);
      }

      const refreshed = await tx.studentProfile.findFirst({
        where: whereClause,
        include: STUDENT_PROFILE_INCLUDE,
      });

      return mapToStudentProfileDetail((refreshed || updatedProfile) as unknown as StudentProfileRecord);
    });
  }
}

export const studentProfileRepository = new StudentProfileRepository();
