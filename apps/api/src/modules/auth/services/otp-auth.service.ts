import crypto from "node:crypto";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { tokenService, TokenService } from "./token.service.js";
import { otpService, OtpService } from "./otp.service.js";
import { sessionService, SessionService } from "./session.service.js";
import { VerifyOtpDto, ResendOtpDto } from "../schemas/auth.schema.js";
import { SessionMetadata, AuthResponse, OTPPurpose } from "../types/auth.types.js";
import { NotFoundError } from "../../../shared/exceptions/not-found-error.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { sendOtpEmail } from "../../../lib/email.js";

export class OtpAuthService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly otpSvc: OtpService = otpService,
    private readonly sessionSvc: SessionService = sessionService
  ) { }

  private async resolveUser(dto: { userId?: string; email?: string; identifier?: string }) {
    if (dto.userId) {
      return this.authRepo.findById(dto.userId);
    }
    const identifier = dto.email || dto.identifier;
    if (identifier) {
      return this.authRepo.findByIdentifier(identifier);
    }
    return null;
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const user = await this.resolveUser(dto);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const purpose: OTPPurpose = (dto.purpose as OTPPurpose) || "LOGIN_2FA";
    const activeTenantId = tenantId || user.memberships[0]?.tenantId;
    await this.otpSvc.verifyOtp(user.id, dto.otp, purpose, activeTenantId);

    if (purpose === "LOGIN_2FA") {
      if (!activeTenantId) {
        throw new UnauthorizedError("No active tenant membership found");
      }

      const policy = await this.securityRepo.findSecurityPolicy(activeTenantId);
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

      const { isNewDevice } = await this.sessionSvc.createSession({
        tenantId: activeTenantId,
        userId: user.id,
        refreshTokenHash,
        metadata,
        refreshExpiresAt,
      });

      await this.authRepo.resetFailedAttempts(user.id, metadata.ipAddress);

      return {
        message: "OTP verified successfully. Login complete.",
        tokens,
        user: userProfile,
        newDevice: isNewDevice,
      };
    }

    if (purpose === "EMAIL_VERIFICATION") {
      await this.authRepo.updateEmailVerified(user.id, true);
      return { message: "Email verified successfully" };
    }

    return {
      userId: user.id,
      purpose,
      message: "Verification successful",
    };
  }

  async resendOtp(dto: ResendOtpDto, tenantId?: string): Promise<AuthResponse> {
    const user = await this.resolveUser(dto);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const purpose: OTPPurpose = (dto.purpose as OTPPurpose) || "LOGIN_2FA";
    const activeTenantId = tenantId || user.memberships[0]?.tenantId;
    const { plainOtp, expiryMinutes } = await this.otpSvc.generateAndSaveOtp(user.id, purpose, activeTenantId);

    const recipientEmail = (dto.email && dto.email.includes("@"))
      ? dto.email
      : (user.email ?? (dto.identifier && dto.identifier.includes("@") ? dto.identifier : undefined));

    if (recipientEmail) {
      await sendOtpEmail(recipientEmail, plainOtp, purpose, expiryMinutes);
    }

    return {
      userId: user.id,
      purpose,
      message: "New verification code has been sent to your email",
    };
  }
}

export const otpAuthService = new OtpAuthService();
