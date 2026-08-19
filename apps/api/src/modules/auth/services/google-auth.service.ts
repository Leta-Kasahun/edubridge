import crypto from "node:crypto";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { parseUserAgent } from "../../../shared/utils/device-parser.util.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { tokenService, TokenService } from "./token.service.js";
import { sessionService, SessionService } from "./session.service.js";
import { SessionMetadata, AuthResponse } from "../types/auth.types.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";

export class GoogleAuthService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly sessionSvc: SessionService = sessionService
  ) {}

  async authenticateWithGoogle(
    googleId: string,
    email: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    let user = await this.authRepo.findByGoogleId(googleId);

    if (!user) {
      const existingEmailUser = await this.authRepo.findByEmail(email);
      if (existingEmailUser) {
        await this.authRepo.linkGoogleAccount(existingEmailUser.id, googleId);
        user = await this.authRepo.findById(existingEmailUser.id);
      }
    }

    if (!user) {
      throw new UnauthorizedError("No EduBridge account found linked with this Google account.");
    }

    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED" || user.status === "LOCKED") {
      throw new UnauthorizedError("Account is inactive or suspended");
    }

    const activeMemberships = user.memberships.filter((m) => m.status === "ACTIVE");
    const activeTenantMembership = tenantId
      ? activeMemberships.find((m) => m.tenantId === tenantId)
      : activeMemberships[0];

    if (!activeTenantMembership) {
      throw new UnauthorizedError("No active membership found for this school");
    }

    const activeTenantId = activeTenantMembership.tenantId;
    const policy = await this.securityRepo.findSecurityPolicy(activeTenantId);
    if (policy && !policy.allowGoogleAuth) {
      throw new UnauthorizedError("Google authentication is disabled for this school.");
    }

    const userProfile = mapUserProfile(user, activeTenantId);
    const tempSessionId = crypto.randomUUID();

    const parsedDevice = parseUserAgent(metadata.userAgent);
    const resolvedDeviceId = metadata.deviceId || "google-auth-client";

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
        deviceType: parsedDevice.deviceType,
      },
      refreshExpiresAt,
    });

    await this.authRepo.resetFailedAttempts(user.id, metadata.ipAddress);
    await this.securityRepo.recordLoginAttempt({
      tenantId: activeTenantId,
      userId: user.id,
      identifier: email,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      deviceId: resolvedDeviceId,
      success: true,
    });

    return {
      tokens,
      user: userProfile,
      newDevice: isNewDevice,
    };
  }
}

export const googleAuthService = new GoogleAuthService();
