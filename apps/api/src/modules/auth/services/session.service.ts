import { sessionRepository, SessionRepository } from "../repository/session.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { SessionMetadata, DeviceType } from "../types/auth.types.js";
import { AUTH_CONSTANTS } from "../../../shared/constants/auth.constants.js";

export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository = sessionRepository,
    private readonly securityRepo: SecurityRepository = securityRepository
  ) {}

  async createSession(params: {
    tenantId: string;
    userId: string;
    refreshTokenHash: string;
    metadata: SessionMetadata;
    refreshExpiresAt: Date;
  }) {
    const policy = await this.securityRepo.findSecurityPolicy(params.tenantId);
    const maxConcurrent = policy?.maxConcurrentSessions || AUTH_CONSTANTS.SESSION.MAX_CONCURRENT;

    await this.sessionRepo.pruneExcessSessions(params.userId, params.tenantId, maxConcurrent);

    const isKnownDevice = params.metadata.deviceId
      ? await this.sessionRepo.hasUserUsedDevice(params.userId, params.metadata.deviceId)
      : false;

    const session = await this.sessionRepo.createSession({
      tenantId: params.tenantId,
      userId: params.userId,
      refreshTokenHash: params.refreshTokenHash,
      deviceId: params.metadata.deviceId || "default",
      deviceType: (params.metadata.deviceType as DeviceType) || "WEB",
      ipAddress: params.metadata.ipAddress,
      userAgent: params.metadata.userAgent || null,
      expiresAt: params.refreshExpiresAt,
    });

    return { session, isNewDevice: !isKnownDevice };
  }

  async revokeSession(sessionId: string, reason?: string) {
    return this.sessionRepo.revokeSession(sessionId, reason);
  }

  async revokeAllUserSessions(userId: string, reason?: string) {
    return this.sessionRepo.revokeAllUserSessions(userId, reason);
  }

  async getActiveSessions(userId: string, tenantId?: string) {
    return this.sessionRepo.findActiveUserSessions(userId, tenantId);
  }
}

export const sessionService = new SessionService();
