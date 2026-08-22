import crypto from "node:crypto";
import { hashPassword } from "../../../../shared/auth/password.js";
import { hashOTP } from "../../../../shared/auth/otp.js";
import {
  generateSchoolAdminUsername,
  generateAdminTempPassword,
  generateOtp,
  getNextSequence,
} from "../../../../shared/utils/generators.js";
import { sendProvisioningInvitationEmail } from "../../../../lib/email.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";
import {
  tenantProvisioningRepository,
  TenantProvisioningRepository,
} from "../repository/tenant-provisioning.repository.js";
import {
  ProvisionSchoolAdminInvitePayload,
  ProvisionSchoolAdminDirectPayload,
  ProvisionSchoolAdminPayload,
  ProvisionSchoolAdminResult,
} from "../types/tenant-provisioning.types.js";

export class TenantProvisioningService {
  constructor(
    private readonly repo: TenantProvisioningRepository = tenantProvisioningRepository
  ) {}

  async inviteSchoolAdmin(
    payload: ProvisionSchoolAdminInvitePayload,
    createdById?: string
  ): Promise<ProvisionSchoolAdminResult> {
    const { tenant, role } = await this.repo.ensureTenantAndRole(
      payload.tenantId || payload.tenantName
    );

    const existingUser = await this.repo.findUserByEmail(payload.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    let sequence = await getNextSequence(tenant.code, "ADMIN");
    let username = generateSchoolAdminUsername(tenant.code, sequence);

    while (await this.repo.findUserByUsername(username)) {
      sequence += 1;
      username = generateSchoolAdminUsername(tenant.code, sequence);
    }

    const plainOtp = generateOtp(6);
    const codeHash = hashOTP(plainOtp);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const { user, invitation } = await this.repo.createProvisionedUser({
      tenantId: tenant.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
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
        status: "PENDING",
      },
    });

    await sendProvisioningInvitationEmail({
      to: payload.email,
      recipientName: `${payload.firstName} ${payload.lastName}`.trim(),
      schoolName: tenant.name,
      roleName: "School Administrator",
      username,
      otpCode: plainOtp,
      expiryHours: 48,
    });

    return {
      method: "INVITATION",
      user,
      invitation: invitation
        ? {
            id: invitation.id,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
            otpCode: plainOtp,
          }
        : undefined,
      message: `School administrator invitation sent successfully to ${payload.email}`,
    };
  }

  async createSchoolAdminDirect(
    payload: ProvisionSchoolAdminDirectPayload,
    createdById?: string
  ): Promise<ProvisionSchoolAdminResult> {
    const { tenant, role } = await this.repo.ensureTenantAndRole(
      payload.tenantId || payload.tenantName
    );

    if (payload.email && payload.email.trim().length > 0) {
      const existingUser = await this.repo.findUserByEmail(payload.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }
    }

    let sequence = await getNextSequence(tenant.code, "ADMIN");
    let username = generateSchoolAdminUsername(tenant.code, sequence);

    while (await this.repo.findUserByUsername(username)) {
      sequence += 1;
      username = generateSchoolAdminUsername(tenant.code, sequence);
    }

    const tempPassword = generateAdminTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const { user } = await this.repo.createProvisionedUser({
      tenantId: tenant.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      username,
      passwordHash,
      emailVerified: false,
      status: "PENDING_FIRST_LOGIN",
      roleId: role.id,
      createdById,
    });

    return {
      method: "DIRECT_CREDENTIALS",
      user,
      credentials: {
        username,
        tempPassword,
      },
      message: "School administrator account created successfully",
    };
  }

  async provisionSchoolAdmin(
    payload: ProvisionSchoolAdminPayload,
    createdById?: string
  ): Promise<ProvisionSchoolAdminResult> {
    if (payload.method === "INVITATION") {
      if (!payload.email || payload.email.trim().length === 0) {
        throw new BadRequestError("Email is required for invitation method");
      }
      return this.inviteSchoolAdmin(
        {
          tenantName: payload.tenantName,
          tenantId: payload.tenantId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
        },
        createdById
      );
    }

    return this.createSchoolAdminDirect(
      {
        tenantName: payload.tenantName,
        tenantId: payload.tenantId,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
      },
      createdById
    );
  }

  async regenerateSchoolAdminCredentials(userId: string): Promise<{
    username: string;
    tempPassword: string;
    message: string;
  }> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.status !== "PENDING_FIRST_LOGIN") {
      throw new BadRequestError(
        "Credentials can only be regenerated for accounts pending first login setup"
      );
    }

    const tempPassword = generateAdminTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    await this.repo.updateUserPassword(userId, passwordHash);

    return {
      username: user.username ?? "",
      tempPassword,
      message: "New temporary credentials generated successfully",
    };
  }
}

export const tenantProvisioningService = new TenantProvisioningService();
