import { NotFoundError } from "../../../shared/exceptions/index.js";
import {
  teacherProfileRepository,
  TeacherProfileRepository,
} from "../repository/teacher-profile.repository.js";
import {
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
  TeacherProfileDetail,
} from "../types/teacher-profile.types.js";

export class TeacherProfileService {
  constructor(
    private readonly repo: TeacherProfileRepository = teacherProfileRepository
  ) {}

  async getProfileByUserId(
    userId: string,
    tenantId?: string
  ): Promise<TeacherProfileDetail> {
    const profile = await this.repo.findByUserId(userId, tenantId);
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
    if (payload.address) {
      addressId = await this.repo.upsertAddress(addressId, payload.address);
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
      if (payload.address) {
        addressId = await this.repo.upsertAddress(
          existing.address?.id,
          payload.address
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
