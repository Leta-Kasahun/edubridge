import crypto from "node:crypto";
import { hashPassword } from "../../../../shared/auth/password.js";
import { hashOTP } from "../../../../shared/auth/otp.js";
import {
  generateTeacherUsername,
  generateTeacherTempPassword,
  generateEmployeeCode,
  generateOtp,
} from "../../../../shared/utils/generators.js";
import { sendProvisioningInvitationEmail } from "../../../../lib/email.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import {
  teacherProvisioningRepository,
  TeacherProvisioningRepository,
} from "../repository/teacher-provisioning.repository.js";
import {
  SingleTeacherProvisionInvitePayload,
  SingleTeacherProvisionDirectPayload,
  SingleTeacherProvisionPayload,
  TeacherProvisionResult,
} from "../types/teacher-provisioning.types.js";

export class TeacherProvisioningService {
  constructor(
    private readonly repo: TeacherProvisioningRepository = teacherProvisioningRepository
  ) {}

  async inviteTeacher(
    payload: SingleTeacherProvisionInvitePayload,
    tenantId: string,
    createdById?: string
  ): Promise<TeacherProvisionResult> {
    const resolvedTenantId = payload.tenantId || tenantId;
    const tenant = await this.repo.findTenantById(resolvedTenantId);
    if (!tenant) {
      throw new NotFoundError("School/Tenant not found");
    }

    const role = await this.repo.findTeacherRole(tenant.id);

    const existingUser = await this.repo.findUserByEmail(payload.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    if (payload.employeeCode) {
      const existingCode = await this.repo.findTeacherByEmployeeCode(
        tenant.id,
        payload.employeeCode
      );
      if (existingCode) {
        throw new ConflictError("Teacher with this employee code already exists");
      }
    }

    let sequence = await this.repo.getNextTeacherSequence(tenant.code);
    let username = generateTeacherUsername(tenant.code, sequence);

    while (await this.repo.findUserByUsername(username)) {
      sequence += 1;
      username = generateTeacherUsername(tenant.code, sequence);
    }

    const employeeCode =
      payload.employeeCode?.trim() || generateEmployeeCode(tenant.code, sequence);

    const plainOtp = generateOtp(6);
    const codeHash = hashOTP(plainOtp);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const { user, invitation } = await this.repo.createProvisionedTeacher({
      tenantId: tenant.id,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      gender: payload.gender,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      employeeCode,
      username,
      passwordHash: null,
      emailVerified: true,
      status: "PENDING_FIRST_LOGIN",
      roleId: role.id,
      createdById,
      otp: {
        codeHash,
        expiresAt,
        purpose: "INVITATION_ACCEPT",
      },
      invitation: {
        tokenHash,
        expiresAt,
        createdById: createdById || "",
      },
    });

    await sendProvisioningInvitationEmail({
      to: payload.email,
      recipientName: `${payload.firstName} ${payload.middleName} ${payload.lastName}`.trim(),
      schoolName: tenant.name,
      roleName: "Teacher",
      username,
      otpCode: plainOtp,
      expiryHours: 48,
    });

    return {
      method: "INVITATION",
      teacher: user,
      invitation: invitation
        ? {
            id: invitation.id,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            otpCode: plainOtp,
          }
        : undefined,
      message: `Teacher invitation dispatched successfully to ${payload.email}`,
    };
  }

  async createTeacherDirect(
    payload: SingleTeacherProvisionDirectPayload,
    tenantId: string,
    createdById?: string
  ): Promise<TeacherProvisionResult> {
    const resolvedTenantId = payload.tenantId || tenantId;
    const tenant = await this.repo.findTenantById(resolvedTenantId);
    if (!tenant) {
      throw new NotFoundError("School/Tenant not found");
    }

    const role = await this.repo.findTeacherRole(tenant.id);

    if (payload.email && payload.email.trim().length > 0) {
      const existingUser = await this.repo.findUserByEmail(payload.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
    }

    if (payload.employeeCode) {
      const existingCode = await this.repo.findTeacherByEmployeeCode(
        tenant.id,
        payload.employeeCode
      );
      if (existingCode) {
        throw new ConflictError("Teacher with this employee code already exists");
      }
    }

    let sequence = await this.repo.getNextTeacherSequence(tenant.code);
    let username = generateTeacherUsername(tenant.code, sequence);

    while (await this.repo.findUserByUsername(username)) {
      sequence += 1;
      username = generateTeacherUsername(tenant.code, sequence);
    }

    const employeeCode =
      payload.employeeCode?.trim() || generateEmployeeCode(tenant.code, sequence);

    const tempPassword = generateTeacherTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const { user } = await this.repo.createProvisionedTeacher({
      tenantId: tenant.id,
      firstName: payload.firstName,
      middleName: payload.middleName,
      lastName: payload.lastName,
      gender: payload.gender,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      employeeCode,
      username,
      passwordHash,
      emailVerified: Boolean(payload.email && payload.email.trim().length > 0),
      status: "PENDING_FIRST_LOGIN",
      roleId: role.id,
      createdById,
    });

    return {
      method: "DIRECT_CREDENTIALS",
      teacher: user,
      credentials: {
        username,
        tempPassword,
      },
      message: "Teacher credentials generated successfully",
    };
  }

  async provisionTeacher(
    payload: SingleTeacherProvisionPayload,
    tenantId: string,
    createdById?: string
  ): Promise<TeacherProvisionResult> {
    if (payload.method === "INVITATION") {
      if (!payload.email || payload.email.trim().length === 0) {
        throw new BadRequestError("Email is required for invitation provisioning");
      }
      return this.inviteTeacher(
        {
          tenantId: payload.tenantId,
          firstName: payload.firstName,
          middleName: payload.middleName,
          lastName: payload.lastName,
          gender: payload.gender,
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          employeeCode: payload.employeeCode,
        },
        tenantId,
        createdById
      );
    }

    return this.createTeacherDirect(payload, tenantId, createdById);
  }
}

export const teacherProvisioningService = new TeacherProvisioningService();
