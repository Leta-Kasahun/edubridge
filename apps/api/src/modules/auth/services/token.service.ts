import crypto from "node:crypto";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../shared/auth/jwt.js";
import { hashToken } from "../../../shared/auth/token.js";
import { TokenPayload, AuthTokens } from "../types/auth.types.js";
import { sessionRepository, SessionRepository } from "../repository/session.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";

export class TokenService {
  constructor(
    private readonly sessionRepo: SessionRepository = sessionRepository,
    private readonly securityRepo: SecurityRepository = securityRepository
  ) {}

  generateTokenPair(params: {
    userId: string;
    sessionId: string;
    roles: string[];
    tenantId?: string;
    deviceId?: string;
    accessExpiresInMinutes?: number;
    refreshExpiresInDays?: number;
  }): { tokens: AuthTokens; refreshTokenHash: string; refreshExpiresAt: Date } {
    const tokenId = crypto.randomUUID();
    const accessMinutes = params.accessExpiresInMinutes ?? 15;
    const refreshDays = params.refreshExpiresInDays ?? 7;

    const accessTtl = `${accessMinutes}m`;
    const refreshTtl = `${refreshDays}d`;

    const accessPayload: TokenPayload = {
      userId: params.userId,
      tenantId: params.tenantId,
      sessionId: params.sessionId,
      roles: params.roles,
      deviceId: params.deviceId,
      tokenId,
      type: "access",
    };

    const refreshPayload = {
      userId: params.userId,
      sessionId: params.sessionId,
    };

    const accessToken = signAccessToken(accessPayload, accessTtl);
    const refreshToken = signRefreshToken(refreshPayload, refreshTtl);
    const refreshTokenHash = hashToken(refreshToken);

    const refreshExpiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);
    const expiresInSeconds = accessMinutes * 60;

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: expiresInSeconds,
        tokenType: "Bearer",
      },
      refreshTokenHash,
      refreshExpiresAt,
    };
  }

  async rotateRefreshToken(
    rawRefreshToken: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const payload = verifyRefreshToken(rawRefreshToken);
    const incomingHash = hashToken(rawRefreshToken);

    const session = await this.sessionRepo.findByRefreshTokenHash(incomingHash);

    if (!session) {
      const activeSession = await this.sessionRepo.findById(payload.sessionId);
      if (activeSession) {
        await this.sessionRepo.flagSuspiciousSession(activeSession.id, "Refresh token reuse detected");
        await this.sessionRepo.revokeAllUserSessions(activeSession.userId, "Potential token theft detected");
        await this.securityRepo.createSecurityEvent({
          tenantId: activeSession.tenantId,
          userId: activeSession.userId,
          sessionId: activeSession.id,
          type: "REFRESH_TOKEN_REUSE",
          riskLevel: "CRITICAL",
          ipAddress: metadata?.ipAddress,
          description: "Reused refresh token detected. Revoking all active user sessions.",
        });
      }
      throw new UnauthorizedError("Invalid refresh token. Session revoked for security.");
    }

    if (session.status !== "ACTIVE" || session.expiresAt < new Date()) {
      throw new UnauthorizedError("Session has expired or has been revoked");
    }

    const policy = await this.securityRepo.findSecurityPolicy(session.tenantId);
    const timeoutMinutes = policy?.sessionTimeoutMinutes ?? 60;
    const idleTimeoutMs = timeoutMinutes * 60 * 1000;
    const isTimedOut = Date.now() - session.lastUsedAt.getTime() > idleTimeoutMs;

    if (isTimedOut) {
      await this.sessionRepo.revokeSession(session.id, "Session timed out due to inactivity");
      throw new UnauthorizedError("Session timed out due to inactivity");
    }

    const membership = session.user.memberships.find(
      (m) => m.tenantId === session.tenantId && m.status === "ACTIVE"
    );

    if (!membership) {
      await this.sessionRepo.revokeSession(session.id, "User no longer has active tenant membership");
      throw new UnauthorizedError("User no longer has active membership in this school");
    }

    const roles = membership.roles.map((r) => r.role.code);

    const { tokens, refreshTokenHash, refreshExpiresAt } = this.generateTokenPair({
      userId: session.userId,
      sessionId: session.id,
      roles,
      tenantId: session.tenantId,
      deviceId: session.deviceId,
      accessExpiresInMinutes: policy?.accessTokenExpiryMinutes,
      refreshExpiresInDays: policy?.refreshTokenExpiryDays,
    });

    await this.sessionRepo.updateRefreshTokenHash(session.id, refreshTokenHash, refreshExpiresAt);
    await this.sessionRepo.updateLastUsed(session.id);

    return { tokens, session };
  }
}

export const tokenService = new TokenService();
