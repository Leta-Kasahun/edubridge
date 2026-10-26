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
import { keycloakConfig } from "../../../config/keycloak.js";
import { verifyKeycloakToken } from "../../../shared/auth/keycloak-jwks.js";

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface KeycloakUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles?: string[];
  };
}

export class KeycloakAuthService {
  constructor(
    private readonly authRepo: AuthRepository = authRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly tokenSvc: TokenService = tokenService,
    private readonly sessionSvc: SessionService = sessionService
  ) {}

  getAuthorizationUrl(customState?: string): string {
    const state = customState || crypto.randomBytes(16).toString("hex");
    const params = new URLSearchParams({
      client_id: keycloakConfig.frontendClientId,
      redirect_uri: keycloakConfig.callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
    });

    return `${keycloakConfig.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<KeycloakTokenResponse> {
    const params = new URLSearchParams({
      code,
      client_id: keycloakConfig.frontendClientId,
      redirect_uri: keycloakConfig.callbackUrl,
      grant_type: "authorization_code",
    });

    if (keycloakConfig.clientSecret) {
      params.append("client_secret", keycloakConfig.clientSecret);
    }

    const response = await fetch(keycloakConfig.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new UnauthorizedError(`Failed to exchange authorization code with Keycloak: ${errText || response.statusText}`);
    }

    return (await response.json()) as KeycloakTokenResponse;
  }

  async fetchKeycloakUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    const response = await fetch(keycloakConfig.userInfoEndpoint, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new UnauthorizedError("Failed to retrieve Keycloak user profile");
    }

    return (await response.json()) as KeycloakUserInfo;
  }

  async processKeycloakCallback(
    code: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const tokenData = await this.exchangeCodeForTokens(code);
    const profile = await this.fetchKeycloakUserInfo(tokenData.access_token);

    return this.authenticateWithKeycloakIdentity(
      profile.sub,
      profile.email,
      metadata,
      tenantId,
      {
        preferredUsername: profile.preferred_username,
        name: profile.name,
        givenName: profile.given_name,
        familyName: profile.family_name,
      }
    );
  }

  async authenticateWithKeycloakToken(
    accessToken: string,
    metadata: SessionMetadata,
    tenantId?: string
  ): Promise<AuthResponse> {
    const payload = await verifyKeycloakToken(accessToken);
    return this.authenticateWithKeycloakIdentity(
      payload.sub,
      payload.email,
      metadata,
      tenantId,
      {
        preferredUsername: payload.preferred_username,
        name: payload.name,
        givenName: payload.given_name,
        familyName: payload.family_name,
      }
    );
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
      return `${baseUrl}/login?keycloak_success=true&auth_data=${payload}`;
    }
    return `${baseUrl}/login?keycloak_success=true`;
  }

  resolveFrontendErrorRedirect(errorMessage: string, customOrigin?: string): string {
    const baseUrl = this.getFrontendBaseUrl(customOrigin);
    return `${baseUrl}/login?error=${encodeURIComponent(errorMessage)}`;
  }

  private async authenticateWithKeycloakIdentity(
    keycloakId: string,
    email: string | undefined,
    metadata: SessionMetadata,
    tenantId?: string,
    profileData?: {
      preferredUsername?: string;
      name?: string;
      givenName?: string;
      familyName?: string;
    }
  ): Promise<AuthResponse> {
    let user = await this.authRepo.findByKeycloakId(keycloakId);

    if (!user && email) {
      const existingEmailUser = await this.authRepo.findByEmail(email);
      if (existingEmailUser) {
        await this.authRepo.linkKeycloakAccount(existingEmailUser.id, keycloakId);
        user = await this.authRepo.findById(existingEmailUser.id);
      }
    }

    if (!user && profileData?.preferredUsername) {
      const existingUsernameUser = await this.authRepo.findByUsername(profileData.preferredUsername);
      if (existingUsernameUser) {
        await this.authRepo.linkKeycloakAccount(existingUsernameUser.id, keycloakId);
        user = await this.authRepo.findById(existingUsernameUser.id);
      }
    }

    if (!user) {
      throw new UnauthorizedError(
        "No EduBridge account found matching this Keycloak user. Please contact your school administrator to link your account."
      );
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
    if (policy && policy.allowKeycloakAuth === false) {
      throw new UnauthorizedError("Keycloak Single Sign-On is disabled for this school.");
    }

    const userProfile = mapUserProfile(user, activeTenantId);
    const tempSessionId = crypto.randomUUID();

    const parsedDevice = parseUserAgent(metadata.userAgent);
    const resolvedDeviceId = metadata.deviceId || "keycloak-auth-client";

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
      identifier: email || profileData?.preferredUsername || keycloakId,
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

export const keycloakAuthService = new KeycloakAuthService();
