import { NotFoundError } from "../../../shared/exceptions/index.js";
import {
  studentProfileRepository,
  StudentProfileRepository,
} from "../repository/student-profile.repository.js";
import {
  CompleteStudentProfilePayload,
  UpdateStudentProfilePayload,
  StudentProfileDetail,
} from "../types/student-profile.types.js";

export class StudentProfileService {
  constructor(
    private readonly repo: StudentProfileRepository = studentProfileRepository
  ) {}

  async getProfileByUserId(
    userId: string,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
    const profile = await this.repo.findByUserId(userId, tenantId);
    if (!profile) {
      throw new NotFoundError("Student profile not found");
    }
    return profile;
  }

  async getProfileById(
    profileId: string,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
    const profile = await this.repo.findById(profileId, tenantId);
    if (!profile) {
      throw new NotFoundError("Student profile not found");
    }
    return profile;
  }

  async completeStudentProfile(
    userId: string,
    payload: CompleteStudentProfilePayload,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
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

  async updateStudentProfile(
    userId: string,
    payload: UpdateStudentProfilePayload,
    tenantId?: string
  ): Promise<StudentProfileDetail> {
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

export const studentProfileService = new StudentProfileService();
