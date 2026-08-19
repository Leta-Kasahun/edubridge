import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { CreateSessionInput } from "../types/auth.types.js";

export class SessionRepository {
  async createSession(data: CreateSessionInput) {
    return runWithoutTenant(async () => {
      return prisma.session.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash,
          deviceId: data.deviceId || "default",
          deviceType: data.deviceType || "WEB",
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          expiresAt: data.expiresAt,
          status: "ACTIVE",
        },
      });
    });
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    return prisma.session.findUnique({
      where: { refreshTokenHash },
      include: {
        user: {
          include: {
            memberships: {
              include: {
                roles: {
                  include: {
                    role: {
                      include: {
                        permissions: {
                          include: {
                            permission: true,
                          },
                        },
                      },
                    },
                  },
                },
                tenant: true,
              },
            },
          },
        },
        tenant: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  async updateRefreshTokenHash(id: string, newRefreshTokenHash: string, expiresAt: Date) {
    return runWithoutTenant(async () => {
      return prisma.session.update({
        where: { id },
        data: {
          refreshTokenHash: newRefreshTokenHash,
          expiresAt,
          lastUsedAt: new Date(),
        },
      });
    });
  }

  async updateLastUsed(id: string, expiresAt?: Date) {
    return runWithoutTenant(async () => {
      return prisma.session.update({
        where: { id },
        data: {
          lastUsedAt: new Date(),
          ...(expiresAt ? { expiresAt } : {}),
        },
      });
    });
  }

  async revokeSession(id: string, reason = "User logged out") {
    return runWithoutTenant(async () => {
      return prisma.session.update({
        where: { id },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });
    });
  }

  async revokeAllUserSessions(userId: string, reason = "All sessions revoked") {
    return runWithoutTenant(async () => {
      return prisma.session.updateMany({
        where: {
          userId,
          status: "ACTIVE",
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });
    });
  }

  async flagSuspiciousSession(id: string, reason = "Suspicious activity detected") {
    return runWithoutTenant(async () => {
      return prisma.session.update({
        where: { id },
        data: {
          status: "SUSPICIOUS",
          revokedAt: new Date(),
          revokeReason: reason,
        },
      });
    });
  }

  async findActiveUserSessions(userId: string, tenantId?: string) {
    return prisma.session.findMany({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        ...(tenantId ? { tenantId } : {}),
      },
      orderBy: { lastUsedAt: "desc" },
    });
  }

  async countActiveSessions(userId: string, tenantId?: string) {
    return prisma.session.count({
      where: {
        userId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
        ...(tenantId ? { tenantId } : {}),
      },
    });
  }

  async hasUserUsedDevice(userId: string, deviceId: string) {
    const existing = await prisma.session.findFirst({
      where: {
        userId,
        deviceId,
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async findLastSession(userId: string) {
    return prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async pruneExcessSessions(userId: string, tenantId: string, maxSessions: number) {
    const activeSessions = await this.findActiveUserSessions(userId, tenantId);
    if (activeSessions.length >= maxSessions) {
      const excessSessions = activeSessions.slice(maxSessions - 1);
      const excessIds = excessSessions.map((s) => s.id);
      if (excessIds.length > 0) {
        await runWithoutTenant(async () => {
          await prisma.session.updateMany({
            where: { id: { in: excessIds } },
            data: {
              status: "REVOKED",
              revokedAt: new Date(),
              revokeReason: "Maximum concurrent sessions limit reached",
            },
          });
        });
      }
    }
  }
}

export const sessionRepository = new SessionRepository();
