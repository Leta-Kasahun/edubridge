import {
  AccountStatus,
  TeacherStatus,
} from "../../../../generated/prisma/client.js";
import { NotFoundError } from "../../../../shared/exceptions/index.js";
import {
  teacherManagementRepository,
  TeacherManagementRepository,
} from "../repository/teacher-management.repository.js";
import {
  TeacherQueryFilters,
  UpdateTeacherProfileData,
  PaginatedTeacherResult,
  ProvisionedTeacherRecord,
} from "../types/teacher-provisioning.types.js";

export class TeacherManagementService {
  constructor(
    private readonly repo: TeacherManagementRepository = teacherManagementRepository
  ) {}

  async getTeachers(
    tenantId: string,
    filters: TeacherQueryFilters = {}
  ): Promise<PaginatedTeacherResult> {
    return this.repo.getTeachers(tenantId, filters);
  }

  async getTeacherById(
    tenantId: string,
    profileId: string
  ) {
    const profile = await this.repo.findTeacherProfileById(tenantId, profileId);
    if (!profile) {
      throw new NotFoundError("Teacher profile not found");
    }
    return profile;
  }

  async updateTeacher(
    tenantId: string,
    profileId: string,
    data: UpdateTeacherProfileData
  ): Promise<ProvisionedTeacherRecord> {
    const updated = await this.repo.updateTeacherProfile(tenantId, profileId, data);
    if (!updated) {
      throw new NotFoundError("Teacher profile not found");
    }
    return updated;
  }

  async deactivateTeacher(
    tenantId: string,
    profileId: string,
    status: TeacherStatus = TeacherStatus.INACTIVE
  ): Promise<ProvisionedTeacherRecord> {
    const userStatus =
      status === TeacherStatus.SUSPENDED
        ? AccountStatus.SUSPENDED
        : AccountStatus.DEACTIVATED;

    const updated = await this.repo.updateTeacherStatus(
      tenantId,
      profileId,
      status,
      userStatus
    );

    if (!updated) {
      throw new NotFoundError("Teacher profile not found");
    }

    return updated;
  }

  async activateTeacher(
    tenantId: string,
    profileId: string
  ): Promise<ProvisionedTeacherRecord> {
    const updated = await this.repo.updateTeacherStatus(
      tenantId,
      profileId,
      TeacherStatus.ACTIVE,
      AccountStatus.ACTIVE
    );

    if (!updated) {
      throw new NotFoundError("Teacher profile not found");
    }

    return updated;
  }
}

export const teacherManagementService = new TeacherManagementService();
