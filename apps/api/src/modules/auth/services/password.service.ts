import crypto from "node:crypto";
import { comparePassword, hashPassword } from "../../../shared/auth/password.js";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { tokenService, TokenService } from "./token.service.js";
import { otpService, OtpService } from "./otp.service.js";
import { sessionService, SessionService } from "./session.service.js";
import { securityEventService, SecurityEventService } from "./security-event.service.js";
import { FirstLoginSetupDto } from "../schemas/auth.schema.js";
import { SessionMetadata, AuthResponse } from "../types/auth.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { BadRequestError } from "../../../shared/exceptions/bad-request-error.js";
import { domainEventBus } from "../../../shared/events/domain-events.js";

export class PasswordService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly otpSvc: OtpService = otpService,
    private readonly sessionSvc: SessionService = sessionService,
    private readonly securityEventSvc: SecurityEventService = securityEventService
  ) { }

  async firstLoginSetup(
    dto: FirstLoginSetupDto,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const identifier = dto.email || dto.username || dto.identifier;
    const user = dto.userId
      ? await this.authRepo.findById(dto.userId)
      : identifier
        ? await this.authRepo.findByIdentifier(identifier)
        : null;

    if (!user) {
      throw new NotFoundError("User account not found");
    }

    const activeTenantId = tenantId || user.memberships[0]?.tenantId;

    if (dto.otp) {
      await this.otpSvc.verifySetupOtp(user.id, dto.otp, activeTenantId);
    } else if (dto.currentPassword) {
      if (!user.passwordHash) {
        throw new BadRequestError(
          "Temporary password is not configured for this account. Please use the email verification code."
        );
      }

      const isCurrentValid = await comparePassword(dto.currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        throw new UnauthorizedError("Current temporary password is incorrect");
      }

      const isSamePassword = await comparePassword(dto.newPassword, user.passwordHash);
      if (isSamePassword) {
        throw new BadRequestError("New password must be different from temporary password");
      }
    } else {
      throw new BadRequestError("Please provide either your verification code or temporary password");
    }

    await this.securityEventSvc.validatePasswordPolicy(dto.newPassword, activeTenantId);

    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.authRepo.updatePassword(user.id, newPasswordHash);
    await this.authRepo.updateStatus(user.id, "ACTIVE");
    await this.authRepo.updateEmailVerified(user.id, true, user.email ?? undefined);

    await this.securityRepo.createSecurityEvent({
      tenantId: activeTenantId,
      userId: user.id,
      type: "PASSWORD_CHANGED",
      riskLevel: "LOW",
      description: "First-time account setup and password configuration completed successfully.",
    });

    const freshUser = await this.authRepo.findById(user.id);
    const userProfile = mapUserProfile(freshUser ?? user, activeTenantId);

    const policy = activeTenantId ? await this.securityRepo.findSecurityPolicy(activeTenantId) : null;
    const sessionId = crypto.randomUUID();
    const resolvedDeviceId = metadata.deviceId || "web-client";

    const { tokens, refreshTokenHash, refreshExpiresAt } = this.tokenSvc.generateTokenPair({
      userId: user.id,
      sessionId,
      roles: userProfile.roles,
      tenantId: activeTenantId || undefined,
      deviceId: resolvedDeviceId,
      accessExpiresInMinutes: policy?.accessTokenExpiryMinutes,
      refreshExpiresInDays: policy?.refreshTokenExpiryDays,
    });

    if (activeTenantId) {
      await this.sessionSvc.createSession({
        tenantId: activeTenantId,
        userId: user.id,
        refreshTokenHash,
        metadata: { ...metadata, deviceId: resolvedDeviceId },
        refreshExpiresAt,
      });
    }

    return {
      tokens,
      user: userProfile,
      message: "Account setup completed successfully.",
    };
  }

  async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    tenantId?: string
  ) {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.passwordHash) {
      throw new NotFoundError("User not found");
    }

    const isValid = await comparePassword(currentPass, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    const isSamePassword = await comparePassword(newPass, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestError("New password must be different from current password");
    }

    const activeTenantId = tenantId || user.memberships[0]?.tenantId;
    await this.securityEventSvc.validatePasswordPolicy(newPass, activeTenantId);

    const newPasswordHash = await hashPassword(newPass);
    await this.authRepo.updatePassword(userId, newPasswordHash);

    const policy = activeTenantId ? await this.securityRepo.findSecurityPolicy(activeTenantId) : null;
    if (policy?.revokeSessionsOnPasswordChange) {
      await this.sessionSvc.revokeAllUserSessions(userId, "Password changed");
    }

    await this.securityRepo.createSecurityEvent({
      tenantId: activeTenantId,
      userId,
      type: "PASSWORD_CHANGED",
      riskLevel: "LOW",
      description: "User password changed successfully.",
    });

    if (activeTenantId) {
      domainEventBus.emitEvent("auth.password_changed_self", {
        tenantId: activeTenantId,
        userId,
      });
    }

    return { message: "Password updated successfully" };
  }


  async adminResetPassword(
    tenantId: string | undefined,
    targetUserId: string,
    newPassword?: string,
    adminUserId?: string
  ): Promise<{ username: string; tempPassword: string; fullName: string }> {
    const user = await this.authRepo.findById(targetUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const activeTenantId = tenantId || user.memberships[0]?.tenantId;
    let effectivePassword = newPassword?.trim();

    if (!effectivePassword) {
      const digits = String(crypto.randomInt(1000, 10000));
      effectivePassword = `Temp@${digits}`;
    }

    await this.securityEventSvc.validatePasswordPolicy(effectivePassword, activeTenantId);

    const newPasswordHash = await hashPassword(effectivePassword);
    await this.authRepo.updatePassword(user.id, newPasswordHash);

    const policy = activeTenantId ? await this.securityRepo.findSecurityPolicy(activeTenantId) : null;
    if (policy?.revokeSessionsOnPasswordChange) {
      await this.sessionSvc.revokeAllUserSessions(user.id, "Password reset by administrator");
    }

    await this.securityRepo.createSecurityEvent({
      tenantId: activeTenantId,
      userId: user.id,
      type: "PASSWORD_CHANGED",
      riskLevel: "LOW",
      description: `Password reset by administrator (${adminUserId || "System"}).`,
    });

    if (activeTenantId) {
      domainEventBus.emitEvent("auth.password_reset_by_admin", {
        tenantId: activeTenantId,
        targetUserId: user.id,
      });
    }

    const fullName = user.teacherProfile
      ? `${user.teacherProfile.firstName} ${user.teacherProfile.lastName || ""}`.trim()
      : user.studentProfile
      ? `${user.studentProfile.firstName} ${user.studentProfile.middleName || ""} ${user.studentProfile.lastName || ""}`.trim()
      : user.username || user.email || "User";

    return {
      username: user.username || user.email || "",
      tempPassword: effectivePassword,
      fullName,
    };
  }
}

export const passwordService = new PasswordService();
