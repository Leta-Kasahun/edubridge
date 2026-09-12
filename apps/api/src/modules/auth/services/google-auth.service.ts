import crypto from "node:crypto";
import { mapUserProfile } from "../../../shared/auth/user-profile.mapper.js";
import { parseUserAgent } from "../../../shared/utils/device-parser.util.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { tokenService, TokenService } from "./token.service.js";
import { sessionService, SessionService } from "./session.service.js";
import { SessionMetadata, AuthResponse } from "../types/auth.types.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { env } from "../../../config/env.js";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}

export class GoogleAuthService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly sessionSvc: SessionService = sessionService
  ) { }

  getAuthorizationUrl(customState?: string): string {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CALLBACK_URL) {
      throw new UnauthorizedError("Google OAuth credentials not configured on the server");
    }
    const state = customState || crypto.randomBytes(16).toString("hex");
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      env.GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      env.GOOGLE_CALLBACK_URL
    )}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent&state=${state}`;
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedError("Failed to exchange authorization code with Google");
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  async fetchGoogleProfile(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedError("Failed to retrieve Google user profile");
    }

    return (await response.json()) as GoogleUserInfo;
  }

  async processGoogleCallback(
    code: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const tokenData = await this.exchangeCodeForTokens(code);
    const profile = await this.fetchGoogleProfile(tokenData.access_token);
    return this.authenticateWithGoogle(profile.sub, profile.email, metadata, tenantId, {
      name: profile.name,
      givenName: profile.given_name,
      familyName: profile.family_name,
      picture: profile.picture,
    });
  }

  private isAllowedOrigin(origin: string): boolean {
    if (env.CORS_ORIGIN === "*") return true;
    const cleanOrigin = origin.replace(/\/$/, "");
    const origins = (env.CORS_ORIGIN || "")
      .split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const cleanFrontendUrl = env.FRONTEND_URL ? env.FRONTEND_URL.trim().replace(/\/$/, "") : "";
    return origins.includes(cleanOrigin) || (Boolean(cleanFrontendUrl) && cleanFrontendUrl === cleanOrigin);
  }

  getFrontendBaseUrl(customOrigin?: string): string {
    if (customOrigin && this.isAllowedOrigin(customOrigin)) {
      return customOrigin.replace(/\/$/, "");
    }

    if (env.FRONTEND_URL) {
      return env.FRONTEND_URL.replace(/\/$/, "");
    }

    const origins = (env.CORS_ORIGIN || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    if (env.NODE_ENV === "production") {
      const prodOrigin = origins.find(
        (o) => !o.includes("localhost") && !o.includes("127.0.0.1") && o !== "*"
      );
      if (prodOrigin) return prodOrigin.replace(/\/$/, "");
    }

    const firstValid = origins.find((o) => o !== "*");
    return (firstValid || "http://localhost:3000").replace(/\/$/, "");
  }

  resolveFrontendRedirect(customOrigin?: string, authResult?: AuthResponse): string {
    const baseUrl = this.getFrontendBaseUrl(customOrigin);
    if (authResult?.tokens?.accessToken && authResult?.user) {
      const payload = Buffer.from(
        JSON.stringify({
          tokens: authResult.tokens,
          user: authResult.user,
        })
      ).toString("base64url");
      return `${baseUrl}/login?google_success=true&auth_data=${payload}`;
    }
    return `${baseUrl}/login?google_success=true`;
  }

  resolveFrontendErrorRedirect(errorMessage: string, customOrigin?: string): string {
    const baseUrl = this.getFrontendBaseUrl(customOrigin);
    return `${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`;
  }

  async authenticateWithGoogle(
    googleId: string,
    email: string,
    metadata: SessionMetadata,
    tenantId?: string,
    googleProfileData?: {
      name?: string;
      givenName?: string;
      familyName?: string;
      picture?: string;
    }
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

    const userProfile = mapUserProfile(user, activeTenantId, {
      photoUrl: googleProfileData?.picture,
    });
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
