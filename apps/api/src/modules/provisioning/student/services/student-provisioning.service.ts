import { hashPassword } from "../../../../shared/auth/password.js";
import {
  generateStudentUsername,
  generateStudentCode,
  generateStudentTempPassword,
} from "../../../../shared/utils/generators.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import {
  studentProvisioningRepository,
  StudentProvisioningRepository,
} from "../repository/student-provisioning.repository.js";
import {
  SingleStudentProvisionPayload,
  StudentProvisionResult,
  StudentQueryFilters,
  PaginatedStudentResult,
  ProvisionedStudentRecord,
  AcademicStructureResponse,
} from "../types/student-provisioning.types.js";

export class StudentProvisioningService {
  constructor(
    private readonly repo: StudentProvisioningRepository = studentProvisioningRepository
  ) {}

  async getAcademicStructure(
    tenantId: string,
    targetAcademicYearId?: string
  ): Promise<AcademicStructureResponse> {
    return this.repo.getAcademicStructure(tenantId, targetAcademicYearId);
  }

  async createGrade(tenantId: string, level: number) {
    const tenant = await this.repo.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }
    return this.repo.createGrade(tenantId, level);
  }

  async createSection(
    tenantId: string,
    academicYearId: string,
    gradeId: string,
    name: string,
    capacity?: number
  ) {
    const tenant = await this.repo.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }

    const academicYear = await this.repo.findAcademicYearById(tenantId, academicYearId);
    if (!academicYear) {
      throw new NotFoundError("Academic year not found");
    }

    const grade = await this.repo.findGradeById(tenantId, gradeId);
    if (!grade) {
      throw new NotFoundError("Grade not found");
    }

    return this.repo.createSection(tenantId, academicYearId, gradeId, name, capacity);
  }

  async getStudents(
    tenantId: string,
    filters: StudentQueryFilters = {}
  ): Promise<PaginatedStudentResult> {
    return this.repo.getStudents(tenantId, filters);
  }

  async getStudentById(
    tenantId: string,
    profileId: string
  ): Promise<ProvisionedStudentRecord> {
    const profile = await this.repo.findStudentProfileById(tenantId, profileId);
    if (!profile) {
      throw new NotFoundError("Student profile not found");
    }
    return profile;
  }

  async activateStudent(
    tenantId: string,
    profileId: string
  ): Promise<ProvisionedStudentRecord> {
    const updated = await this.repo.updateStudentStatus(
      tenantId,
      profileId,
      "ACTIVE",
      "ACTIVE"
    );
    if (!updated) {
      throw new NotFoundError("Student profile not found");
    }
    return updated;
  }

  async deactivateStudent(
    tenantId: string,
    profileId: string,
    status: "INACTIVE" | "SUSPENDED" = "INACTIVE"
  ): Promise<ProvisionedStudentRecord> {
    const userStatus = status === "SUSPENDED" ? "SUSPENDED" : "DEACTIVATED";
    const updated = await this.repo.updateStudentStatus(
      tenantId,
      profileId,
      status,
      userStatus
    );
    if (!updated) {
      throw new NotFoundError("Student profile not found");
    }
    return updated;
  }

  async provisionStudent(
    payload: SingleStudentProvisionPayload,
    tenantId: string,
    createdById?: string
  ): Promise<StudentProvisionResult> {
    const resolvedTenantId = payload.tenantId || tenantId;
    const tenant = await this.repo.findTenantById(resolvedTenantId);
    if (!tenant) {
      throw new NotFoundError("School/Tenant not found");
    }

    const academicYear = await this.repo.findAcademicYearById(
      resolvedTenantId,
      payload.academicYearId
    );
    if (!academicYear) {
      throw new NotFoundError("Academic year not found");
    }

    const grade = await this.repo.findGradeById(
      resolvedTenantId,
      payload.gradeId
    );
    if (!grade) {
      throw new NotFoundError("Grade not found");
    }

    let section = null;
    if (payload.sectionId) {
      section = await this.repo.findSectionById(resolvedTenantId, payload.sectionId);
      if (!section) {
        throw new NotFoundError("Section not found");
      }
    } else if (payload.sectionName && payload.sectionName.trim().length > 0) {
      section = await this.repo.findOrCreateSection(
        resolvedTenantId,
        academicYear.id,
        grade.id,
        payload.sectionName
      );
    }

    if (!section) {
      throw new BadRequestError("Valid section is required for student enrollment");
    }

    const role = await this.repo.findStudentRole(tenant.id);
    if (!role) {
      throw new NotFoundError("Student role not configured for this school");
    }

    if (payload.email && payload.email.trim().length > 0) {
      const existingUser = await this.repo.findUserByEmail(payload.email.trim());
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
    }

    if (payload.studentCode && payload.studentCode.trim().length > 0) {
      const existingCode = await this.repo.findStudentByStudentCode(
        tenant.id,
        payload.studentCode.trim()
      );
      if (existingCode) {
        throw new ConflictError("Student with this student code already exists");
      }
    }

    let sequence = await this.repo.getNextStudentSequence(tenant.code);
    let username = generateStudentUsername(tenant.code, sequence);

    while (await this.repo.findUserByUsername(username)) {
      sequence += 1;
      username = generateStudentUsername(tenant.code, sequence);
    }

    const studentCode =
      payload.studentCode?.trim() || generateStudentCode(tenant.code, sequence);

    const tempPassword = generateStudentTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const parsedDob = payload.dateOfBirth
      ? new Date(payload.dateOfBirth)
      : undefined;

    const { user, enrollment } = await this.repo.createProvisionedStudent({
      tenantId: tenant.id,
      academicYearId: academicYear.id,
      sectionId: section.id,
      firstName: payload.firstName.trim(),
      middleName: payload.middleName.trim(),
      lastName: payload.lastName?.trim(),
      gender: payload.gender,
      studentCode,
      username,
      passwordHash,
      dateOfBirth: parsedDob,
      email: payload.email?.trim(),
      nationality: payload.nationality?.trim(),
      roleId: role.id,
      createdById,
    });

    return {
      student: user,
      credentials: {
        username,
        tempPassword,
      },
      enrollment: {
        academicYearId: academicYear.id,
        sectionId: section.id,
        sectionName: section.name,
        gradeLevel: grade.level,
      },
      message: "Student provisioned and enrolled successfully",
    };
  }
}

export const studentProvisioningService = new StudentProvisioningService();
