import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { CreateOtpInput, OTPPurpose } from "../types/auth.types.js";

export class OtpRepository {
  async createOtp(data: CreateOtpInput) {
    return runWithoutTenant(async () => {
      await this.invalidatePendingOtps(data.userId, data.purpose);
      return prisma.oTPCode.create({
        data: {
          userId: data.userId,
          codeHash: data.codeHash,
          purpose: data.purpose,
          expiresAt: data.expiresAt,
          attemptCount: 0,
        },
      });
    });
  }

  async findValidOtp(userId: string, purpose: OTPPurpose) {
    return prisma.oTPCode.findFirst({
      where: {
        userId,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async consumeOtp(id: string) {
    return runWithoutTenant(async () => {
      return prisma.oTPCode.update({
        where: { id },
        data: { consumedAt: new Date() },
      });
    });
  }

  async incrementOtpAttempts(id: string) {
    return runWithoutTenant(async () => {
      return prisma.oTPCode.update({
        where: { id },
        data: { attemptCount: { increment: 1 } },
      });
    });
  }

  async countRecentOtpResends(userId: string, purpose: OTPPurpose, since: Date) {
    return prisma.oTPCode.count({
      where: {
        userId,
        purpose,
        createdAt: { gte: since },
      },
    });
  }

  async invalidatePendingOtps(userId: string, purpose: OTPPurpose) {
    return runWithoutTenant(async () => {
      return prisma.oTPCode.updateMany({
        where: {
          userId,
          purpose,
          consumedAt: null,
        },
        data: {
          consumedAt: new Date(),
        },
      });
    });
  }
}

export const otpRepository = new OtpRepository();
