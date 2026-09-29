import { NotFoundError } from "../../../shared/exceptions/index.js";
import { prisma } from "../../../lib/prisma.js";
import {
  teacherProfileRepository,
  TeacherProfileRepository,
} from "../repository/teacher-profile.repository.js";
import {
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
  TeacherProfileDetail,
  AddressData,
} from "../types/teacher-profile.types.js";

function hasAddressContent(address?: AddressData | null): boolean {
  if (!address) return false;
  return Object.values(address).some((v) =>
    typeof v === "string" ? v.trim().length > 0 : Boolean(v)
  );
}

export class TeacherProfileService {
  constructor(
    private readonly repo: TeacherProfileRepository = teacherProfileRepository
  ) {}

  async getProfileByUserId(
    userId: string,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    let profile = await this.repo.findByUserId(userId, tenantId);
    if (!profile) {
      const effectiveTenantId =
        tenantId ||
        (
          await prisma.tenantMembership.findFirst({
            where: { userId, status: "ACTIVE" },
            select: { tenantId: true },
          })
        )?.tenantId;

      if (effectiveTenantId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          const employeeCode = `TCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await prisma.teacherProfile.create({
            data: {
              tenantId: effectiveTenantId,
              userId,
              employeeCode,
              firstName: user.firstName || "Teacher",
              middleName: "",
              lastName: user.lastName || "",
              gender: "FEMALE",
              email: user.email || null,
              phoneNumber: null,
              status: "ACTIVE",
            },
          });
          profile = await this.repo.findByUserId(userId, effectiveTenantId);
        }
      }
    }

    if (!profile) {
      throw new NotFoundError("Teacher profile not found");
    }
    return profile;
  }

  async getProfileById(
    profileId: string,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const profile = await this.repo.findById(profileId, tenantId);
    if (!profile) {
      throw new NotFoundError("Teacher profile not found");
    }
    return profile;
  }

  async completeTeacherProfile(
    userId: string,
    payload: CompleteTeacherProfilePayload,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const existing = await this.getProfileByUserId(userId, tenantId);

    let addressId: string | null = existing.address?.id ?? null;
    if (hasAddressContent(payload.address)) {
      addressId = await this.repo.upsertAddress(addressId, payload.address!);
    }

    return this.repo.completeProfile(
      existing.id,
      payload,
      addressId,
      tenantId
    );
  }

  async updateTeacherProfile(
    userId: string,
    payload: UpdateTeacherProfilePayload,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const existing = await this.getProfileByUserId(userId, tenantId);

    let addressId: string | null | undefined = undefined;
    if (payload.address !== undefined) {
      if (hasAddressContent(payload.address)) {
        addressId = await this.repo.upsertAddress(
          existing.address?.id,
          payload.address!
        );
      } else {
        addressId = null;
      }
    }

    return this.repo.updateProfile(
      existing.id,
      payload,
      addressId,
      tenantId
    );
  }
}

export const teacherProfileService = new TeacherProfileService();
