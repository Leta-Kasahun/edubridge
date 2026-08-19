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

export class PasswordService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly otpSvc: OtpService = otpService,
    private readonly sessionSvc: SessionService = sessionService,
    private readonly securityEventSvc: SecurityEventService = securityEventService
  ) {}

  async firstLoginSetup(
    dto: FirstLoginSetupDto,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const user = dto.userId
      ? await this.authRepo.findById(dto.userId)
      : dto.email
        ? await this.authRepo.findByEmail(dto.email)
        : null;
    if (!user || !user.passwordHash) {
      throw new NotFoundError("User not found");
    }

    const isCurrentValid = await comparePassword(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const isSamePassword = await comparePassword(dto.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestError("New password must be different from current password");
    }

    const activeTenantId = tenantId || user.memberships[0]?.tenantId;
    await this.securityEventSvc.validatePasswordPolicy(dto.newPassword, activeTenantId);

    const newPasswordHash = await hashPassword(dto.newPassword);
    await this.authRepo.updatePassword(user.id, newPasswordHash);
    await this.authRepo.updateEmailVerified(user.id, false, dto.email);
    await this.authRepo.updateStatus(user.id, "ACTIVE");

    await this.otpSvc.generateAndSaveOtp(user.id, "EMAIL_VERIFICATION", activeTenantId);

    const policy = activeTenantId ? await this.securityRepo.findSecurityPolicy(activeTenantId) : null;
    const userProfile = mapUserProfile(user, activeTenantId);
    const tempSessionId = crypto.randomUUID();

    const { tokens, refreshTokenHash, refreshExpiresAt } = this.tokenSvc.generateTokenPair({
      userId: user.id,
      sessionId: tempSessionId,
      roles: userProfile.roles,
      tenantId: activeTenantId,
      deviceId: metadata.deviceId,
      accessExpiresInMinutes: policy?.accessTokenExpiryMinutes,
      refreshExpiresInDays: policy?.refreshTokenExpiryDays,
    });

    await this.sessionSvc.createSession({
      tenantId: activeTenantId as string,
      userId: user.id,
      refreshTokenHash,
      metadata,
      refreshExpiresAt,
    });

    return {
      tokens,
      user: userProfile,
      message: "Account setup complete. Verification code sent to email.",
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

    return { message: "Password updated successfully" };
  }
}

export const passwordService = new PasswordService();
