import { prisma, ExtendedPrismaClient } from "../../../lib/prisma.js";
import {
  calculateAge,
  formatFullAddress,
  normalizeEthiopianPhone,
  validateAddressHierarchy,
  parseDate,
} from "../../../shared/utils/index.js";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toUuidOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  return UUID_PATTERN.test(value) ? value : null;
}
import {
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
  TeacherProfileDetail,
  AddressData,
} from "../types/teacher-profile.types.js";

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

    const addressPayload = {
      regionId: toUuidOrNull(data.regionId),
      zoneId: toUuidOrNull(data.zoneId),
      woredaId: toUuidOrNull(data.woredaId),
      kebeleId: toUuidOrNull(data.kebeleId),
      cityId: toUuidOrNull(data.cityId),
      subCityId: toUuidOrNull(data.subCityId),
      specificLocation: data.specificLocation || null,
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
