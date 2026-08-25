import { prisma, ExtendedPrismaClient } from "../../../lib/prisma.js";
import {
  calculateAge,
  formatFullAddress,
  normalizeEthiopianPhone,
  validateAddressHierarchy,
  parseDate,
} from "../../../shared/utils/index.js";
import {
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
  TeacherProfileDetail,
  AddressData,
} from "../types/teacher-profile.types.js";

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

const PROFILE_INCLUDE = {
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
      subCity: { select: { id: true, name: true } },
    },
  },
} as const;

type ProfileRecord = NonNullable<Awaited<ReturnType<ExtendedPrismaClient["teacherProfile"]["findFirst"]>> & {
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
    subCityId: string | null;
    specificLocation: string | null;
    region?: { id: string; name: string } | null;
    zone?: { id: string; name: string } | null;
    woreda?: { id: string; name: string } | null;
    kebele?: { id: string; name: string } | null;
    city?: { id: string; name: string } | null;
    subCity?: { id: string; name: string } | null;
  } | null;
}>;

function mapToTeacherProfileDetail(profile: ProfileRecord): TeacherProfileDetail {
  const addr = profile.address;
  const formattedAddress = addr
    ? formatFullAddress({
        regionName: addr.region?.name,
        zoneName: addr.zone?.name,
        woredaName: addr.woreda?.name,
        kebeleName: addr.kebele?.name,
        cityName: addr.city?.name,
        subCityName: addr.subCity?.name,
        specificLocation: addr.specificLocation,
      })
    : undefined;

  return {
    id: profile.id,
    tenantId: profile.tenantId,
    userId: profile.userId,
    employeeCode: profile.employeeCode,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    fullName: `${profile.firstName} ${profile.middleName} ${profile.lastName}`,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth,
    age: calculateAge(profile.dateOfBirth),
    phoneNumber: profile.phoneNumber,
    email: profile.email,
    status: profile.status,
    accountStatus: profile.user?.status ?? null,
    username: profile.user?.username ?? null,
    emailVerified: profile.user?.emailVerified ?? false,
    address: addr
      ? {
          id: addr.id,
          regionId: addr.regionId,
          zoneId: addr.zoneId,
          woredaId: addr.woredaId,
          kebeleId: addr.kebeleId,
          cityId: addr.cityId,
          subCityId: addr.subCityId,
          specificLocation: addr.specificLocation,
          regionName: addr.region?.name,
          zoneName: addr.zone?.name,
          woredaName: addr.woreda?.name,
          kebeleName: addr.kebele?.name,
          cityName: addr.city?.name,
          subCityName: addr.subCity?.name,
          formattedAddress,
        }
      : null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export class TeacherProfileRepository {
  async findByUserId(userId: string, tenantId?: string): Promise<TeacherProfileDetail | null> {
    const whereClause: { userId: string; tenantId?: string } = { userId };
    if (tenantId) whereClause.tenantId = tenantId;

    const profile = await prisma.teacherProfile.findFirst({
      where: whereClause,
      include: PROFILE_INCLUDE,
    });

    if (!profile) return null;
    return mapToTeacherProfileDetail(profile as unknown as ProfileRecord);
  }

  async findById(id: string, tenantId?: string): Promise<TeacherProfileDetail | null> {
    const whereClause: { id: string; tenantId?: string } = { id };
    if (tenantId) whereClause.tenantId = tenantId;

    const profile = await prisma.teacherProfile.findFirst({
      where: whereClause,
      include: PROFILE_INCLUDE,
    });

    if (!profile) return null;
    return mapToTeacherProfileDetail(profile as unknown as ProfileRecord);
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

  async completeProfile(
    profileId: string,
    payload: CompleteTeacherProfilePayload,
    addressId?: string | null,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const normalizedPhone = payload.phoneNumber
      ? normalizeEthiopianPhone(payload.phoneNumber)
      : null;

    const parsedDob = parseDate(payload.dateOfBirth) || payload.dateOfBirth;

    return prisma.$transaction(async (tx) => {
      const whereClause: { id: string; tenantId?: string } = { id: profileId };
      if (tenantId) whereClause.tenantId = tenantId;

      const updatedProfile = await tx.teacherProfile.update({
        where: whereClause,
        data: {
          firstName: payload.firstName,
          middleName: payload.middleName,
          lastName: payload.lastName,
          gender: payload.gender,
          dateOfBirth: parsedDob,
          phoneNumber: normalizedPhone,
          email: payload.email || null,
          addressId: addressId ?? undefined,
        },
        include: PROFILE_INCLUDE,
      });

      if (updatedProfile.userId) {
        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            email: payload.email || undefined,
            status: "ACTIVE",
          },
        });
      }

      return mapToTeacherProfileDetail(updatedProfile as unknown as ProfileRecord);
    });
  }

  async updateProfile(
    profileId: string,
    payload: UpdateTeacherProfilePayload,
    addressId?: string | null,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const updateData: Record<string, unknown> = {};

    if (payload.firstName !== undefined) updateData.firstName = payload.firstName;
    if (payload.middleName !== undefined) updateData.middleName = payload.middleName;
    if (payload.lastName !== undefined) updateData.lastName = payload.lastName;
    if (payload.gender !== undefined) updateData.gender = payload.gender;
    if (payload.dateOfBirth !== undefined) {
      updateData.dateOfBirth = payload.dateOfBirth ? parseDate(payload.dateOfBirth) : null;
    }
    if (payload.phoneNumber !== undefined) {
      updateData.phoneNumber = payload.phoneNumber
        ? normalizeEthiopianPhone(payload.phoneNumber)
        : null;
    }
    if (payload.email !== undefined) updateData.email = payload.email || null;
    if (addressId !== undefined) updateData.addressId = addressId;

    return prisma.$transaction(async (tx) => {
      const whereClause: { id: string; tenantId?: string } = { id: profileId };
      if (tenantId) whereClause.tenantId = tenantId;

      const updatedProfile = await tx.teacherProfile.update({
        where: whereClause,
        data: updateData,
        include: PROFILE_INCLUDE,
      });

      if (updatedProfile.userId && (payload.firstName || payload.lastName || payload.email)) {
        const userUpdate: Record<string, unknown> = {};
        if (payload.firstName) userUpdate.firstName = payload.firstName;
        if (payload.lastName) userUpdate.lastName = payload.lastName;
        if (payload.email) userUpdate.email = payload.email;

        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: userUpdate,
        });
      }

      return mapToTeacherProfileDetail(updatedProfile as unknown as ProfileRecord);
    });
  }
}

export const teacherProfileRepository = new TeacherProfileRepository();

