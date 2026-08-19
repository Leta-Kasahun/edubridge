import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { CreateLoginAttemptInput, CreateSecurityEventInput } from "../types/auth.types.js";
import { Prisma } from "../../../generated/prisma/client.js";

export class SecurityRepository {
  async recordLoginAttempt(data: CreateLoginAttemptInput) {
    return runWithoutTenant(async () => {
      return prisma.loginAttempt.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          identifier: data.identifier,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          deviceId: data.deviceId,
          success: data.success,
          failureReason: data.failureReason,
        },
      });
    });
  }

  async countRecentFailedAttempts(identifier: string, ipAddress: string, since: Date) {
    return prisma.loginAttempt.count({
      where: {
        OR: [{ identifier }, { ipAddress }],
        success: false,
        createdAt: { gte: since },
      },
    });
  }

  async findLastSuccessfulAttempt(userId: string) {
    return prisma.loginAttempt.findFirst({
      where: {
        userId,
        success: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createSecurityEvent(data: CreateSecurityEventInput) {
    return runWithoutTenant(async () => {
      return prisma.securityEvent.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          sessionId: data.sessionId,
          type: data.type,
          riskLevel: data.riskLevel || "LOW",
          ipAddress: data.ipAddress,
          description: data.description,
          metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        },
      });
    });
  }

  async findSecurityPolicy(tenantId: string) {
    return prisma.securityPolicy.findUnique({
      where: { tenantId },
    });
  }

  async findRecentSecurityEvents(userId: string, limit = 10) {
    return prisma.securityEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async resolveSecurityEvent(id: string, resolvedById: string) {
    return runWithoutTenant(async () => {
      return prisma.securityEvent.update({
        where: { id },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedById,
        },
      });
    });
  }
}

export const securityRepository = new SecurityRepository();
