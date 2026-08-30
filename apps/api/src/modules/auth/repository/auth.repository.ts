import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { AccountStatus } from "../../../generated/prisma/client.js";

const AUTH_USER_INCLUDE = {
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
  teacherProfile: {
    select: {
      firstName: true,
      middleName: true,
      lastName: true,
    },
  },
  studentProfile: {
    select: {
      firstName: true,
      middleName: true,
      lastName: true,
    },
  },
} as const;

export class AuthRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: AUTH_USER_INCLUDE,
    });
  }

  async findByIdentifier(identifier: string) {
    const isEmail = identifier.includes("@");
    return prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: identifier, mode: "insensitive" } }
        : { username: { equals: identifier, mode: "insensitive" } },
      include: AUTH_USER_INCLUDE,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include: AUTH_USER_INCLUDE,
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      include: AUTH_USER_INCLUDE,
    });
  }

  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId },
      include: AUTH_USER_INCLUDE,
    });
  }

  async linkGoogleAccount(userId: string, googleId: string) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: { googleId, emailVerified: true },
      });
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    });
  }

  async updateStatus(userId: string, status: AccountStatus) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    });
  }

  async updateEmailVerified(userId: string, emailVerified: boolean, email?: string) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified,
          ...(email ? { email, pendingEmail: null } : {}),
        },
      });
    });
  }

  async incrementFailedAttempts(userId: string, lockedUntil?: Date | null) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: { increment: 1 },
          ...(lockedUntil !== undefined ? { lockedUntil } : {}),
        },
      });
    });
  }

  async resetFailedAttempts(userId: string, lastLoginIp?: string) {
    return runWithoutTenant(async () => {
      return prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          ...(lastLoginIp ? { lastLoginIp } : {}),
        },
      });
    });
  }
}

export const authRepository = new AuthRepository();
