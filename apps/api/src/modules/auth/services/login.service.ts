import crypto from "node:crypto";
import { comparePassword } from "../../../shared/auth/password.js";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { parseUserAgent } from "../../../shared/utils/device-parser.util.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { authCacheService, AuthCacheService } from "./auth-cache.service.js";
import { tokenService, TokenService } from "./token.service.js";
import { otpService, OtpService } from "./otp.service.js";
import { sessionService, SessionService } from "./session.service.js";
import { securityEventService, SecurityEventService } from "./security-event.service.js";
import { LoginDto } from "../schemas/auth.schema.js";
import { SessionMetadata, AuthResponse } from "../types/auth.types.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { sendOtpEmail } from "../../../lib/email.js";
import { OTPPurpose } from "../../../shared/enums/index.js";
import { activityRecorderService } from "../../activity-log/services/activity-recorder.service.js";

export class LoginService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly cacheSvc: AuthCacheService = authCacheService,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly otpSvc: OtpService = otpService,
    private readonly sessionSvc: SessionService = sessionService,
    private readonly securityEventSvc: SecurityEventService = securityEventService
  ) { }

  async login(dto: LoginDto, metadata: SessionMetadata, tenantId?: string): Promise<AuthResponse> {
    const identifier = (dto.email || dto.identifier)!.trim();

    await this.securityEventSvc.checkBruteForce(identifier, metadata.ipAddress, tenantId);

    const user = await this.authRepo.findByIdentifier(identifier);

    if (!user || !user.passwordHash) {
      await this.cacheSvc.recordFailedAttempt(identifier, 900);
      await this.securityRepo.recordLoginAttempt({
        tenantId,
        identifier,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        deviceId: dto.deviceId,
        success: false,
        failureReason: "INVALID_CREDENTIALS",
      });
      throw new UnauthorizedError("Invalid credentials");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError("Account is temporarily locked. Please try again later.");
    }

    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED" || user.status === "LOCKED") {
      throw new UnauthorizedError("Account is inactive or suspended");
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.cacheSvc.recordFailedAttempt(identifier, 900);
      await this.authRepo.incrementFailedAttempts(user.id);
      await this.securityRepo.recordLoginAttempt({
        tenantId,
        userId: user.id,
        identifier,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        deviceId: dto.deviceId,
        success: false,
        failureReason: "INVALID_CREDENTIALS",
      });
      throw new UnauthorizedError("Invalid credentials");
    }

    const activeMemberships = user.memberships.filter((m) => m.status === "ACTIVE");
    const activeTenantMembership = tenantId
      ? activeMemberships.find((m) => m.tenantId === tenantId)
      : activeMemberships[0];

    const allRoles = user.memberships.flatMap((m) => m.roles.map((r) => r.role.code));
    const isSystemAdmin = allRoles.includes("SYSTEM_ADMIN");
    if (isSystemAdmin) {
      const { plainOtp, expiryMinutes } = await this.otpSvc.generateAndSaveOtp(user.id, "LOGIN_2FA", tenantId);
      const recipientEmail = user.email || (identifier.includes("@") ? identifier : undefined);
      if (recipientEmail) {
        await sendOtpEmail(recipientEmail, plainOtp, OTPPurpose.LOGIN_2FA, expiryMinutes);
      }
      await this.securityRepo.recordLoginAttempt({
        tenantId,
        userId: user.id,
        identifier,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        deviceId: dto.deviceId,
        success: true,
        failureReason: "OTP_REQUIRED",
      });
      return {
        requiresOtp: true,
        userId: user.id,
        purpose: "LOGIN_2FA",
        message: "System Admin verification required. Two-factor OTP code has been sent to your email.",
      };
    }

    if (!activeTenantMembership) {
      throw new UnauthorizedError("No active membership found for this school");
    }

    if (user.status === "PENDING_FIRST_LOGIN") {
      return {
        requiresFirstLoginSetup: true,
        userId: user.id,
        message: "First login setup required. Please update password and verify email.",
      };
    }

    const activeTenantId = activeTenantMembership.tenantId;
    const policy = await this.securityRepo.findSecurityPolicy(activeTenantId);

    const suspiciousLogin = await this.securityEventSvc.detectSuspiciousLogin(
      user.id,
      metadata.ipAddress,
      activeTenantId
    );

    const userProfile = mapUserProfile(user, activeTenantId);
    const tempSessionId = crypto.randomUUID();

    const parsedDevice = parseUserAgent(metadata.userAgent);
    const resolvedDeviceType = dto.deviceType || parsedDevice.deviceType;
    const resolvedDeviceId = dto.deviceId || "web-client";

    const { tokens, refreshTokenHash, refreshExpiresAt } = this.tokenSvc.generateTokenPair({
      userId: user.id,
      sessionId: tempSessionId,
      roles: userProfile.roles,
      tenantId: activeTenantId,
      deviceId: resolvedDeviceId,
      accessExpiresInMinutes: policy?.accessTokenExpiryMinutes,
      refreshExpiresInDays: policy?.refreshTokenExpiryDays,
    });

    const { isNewDevice } = await this.sessionSvc.createSession({
      tenantId: activeTenantId,
      userId: user.id,
      refreshTokenHash,
      metadata: {
        ...metadata,
        deviceId: resolvedDeviceId,
        deviceName: parsedDevice.deviceName,
        deviceType: resolvedDeviceType,
      },
      refreshExpiresAt,
    });

    if (isNewDevice && policy?.notifyOnNewDevice) {
      await this.securityRepo.createSecurityEvent({
        tenantId: activeTenantId,
        userId: user.id,
        type: "NEW_DEVICE",
        riskLevel: "LOW",
        ipAddress: metadata.ipAddress,
        description: `New device detected: ${parsedDevice.deviceName} (${resolvedDeviceId}).`,
      });
    }

    await this.cacheSvc.clearFailedAttempts(identifier);
    await this.authRepo.resetFailedAttempts(user.id, metadata.ipAddress);
    void activityRecorderService.record({
      tenantId: activeTenantId,
      userId: user.id,
      action: "LOGIN",
      resource: "AUTH",
      ipAddress: metadata.ipAddress,
      metadata: {
        description: "User logged into the platform",
        userAgent: metadata.userAgent,
        deviceId: resolvedDeviceId,
      },
    });
    await this.securityRepo.recordLoginAttempt({
      tenantId: activeTenantId,
      userId: user.id,
      identifier,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceId: resolvedDeviceId,
      success: true,
    });

    return {
      message: "Login successful",
      tokens,
      user: userProfile,
      newDevice: isNewDevice,
      suspiciousLogin,
    };
  }
}

export const loginService = new LoginService();
