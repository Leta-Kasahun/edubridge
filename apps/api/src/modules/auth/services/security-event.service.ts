import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { authRepository, AuthRepository } from "../repository/auth.repository.js";
import { authCacheService, AuthCacheService } from "./auth-cache.service.js";
import { BadRequestError } from "../../../shared/exceptions/bad-request-error.js";
import { UnauthorizedError } from "../../../shared/exceptions/unauthorized-error.js";
import { AUTH_CONSTANTS } from "../../../shared/constants/auth.constants.js";

export class SecurityEventService {
  constructor(
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly authRepo: AuthRepository = authRepository,
    private readonly cacheSvc: AuthCacheService = authCacheService
  ) {}

  async validatePasswordPolicy(password: string, tenantId?: string) {
    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    const minLength = policy?.minPasswordLength ?? 8;
    const maxLength = policy?.maxPasswordLength ?? 128;
    const requireUpper = policy?.requireUppercase ?? true;
    const requireLower = policy?.requireLowercase ?? true;
    const requireNumbers = policy?.requireNumbers ?? true;
    const requireSpecial = policy?.requireSpecialChars ?? true;

    if (password.length < minLength || password.length > maxLength) {
      throw new BadRequestError(`Password must be between ${minLength} and ${maxLength} characters`);
    }
    if (requireUpper && !/[A-Z]/.test(password)) {
      throw new BadRequestError("Password must contain at least one uppercase letter");
    }
    if (requireLower && !/[a-z]/.test(password)) {
      throw new BadRequestError("Password must contain at least one lowercase letter");
    }
    if (requireNumbers && !/\d/.test(password)) {
      throw new BadRequestError("Password must contain at least one number");
    }
    if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      throw new BadRequestError("Password must contain at least one special character");
    }
  }

  async checkBruteForce(identifier: string, ipAddress: string, tenantId?: string) {
    const isLocked = await this.cacheSvc.isLockedOut(identifier);
    if (isLocked) {
      throw new UnauthorizedError("Account is temporarily locked due to multiple failed login attempts.");
    }

    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    const maxAttempts = policy?.maxFailedAttempts ?? AUTH_CONSTANTS.LOCKOUT.MAX_FAILED_ATTEMPTS;
    const windowMinutes = policy?.failedAttemptWindowMinutes ?? AUTH_CONSTANTS.LOCKOUT.WINDOW_MINUTES;
    const lockoutMinutes = policy?.lockoutDurationMinutes ?? AUTH_CONSTANTS.LOCKOUT.DURATION_MINUTES;

    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    const user = await this.authRepo.findByIdentifier(identifier);

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedError("Account is temporarily locked due to multiple failed login attempts.");
    }

    const failedCount = await this.securityRepo.countRecentFailedAttempts(identifier, windowStart, user?.id);

    if (failedCount >= maxAttempts) {
      const lockedUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      await this.cacheSvc.setLockout(identifier, lockoutMinutes * 60);

      if (user) {
        await this.authRepo.incrementFailedAttempts(user.id, lockedUntil);
        await this.securityRepo.createSecurityEvent({
          tenantId,
          userId: user.id,
          type: "ACCOUNT_LOCKED",
          riskLevel: "HIGH",
          ipAddress,
          description: `Account temporarily locked due to ${failedCount} failed login attempts.`,
        });
      }
      throw new UnauthorizedError(`Account locked due to multiple failed login attempts. Try again in ${lockoutMinutes} minutes.`);
    }
  }

  async detectSuspiciousLogin(userId: string, currentIp: string, tenantId?: string) {
    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    if (policy && !policy.detectSuspiciousLogin) {
      return false;
    }

    const lastAttempt = await this.securityRepo.findLastSuccessfulAttempt(userId);
    if (!lastAttempt) {
      return false;
    }

    const isDifferentIp = lastAttempt.ipAddress !== currentIp;
    if (!isDifferentIp) {
      return false;
    }

    const elapsedMinutes = (Date.now() - lastAttempt.createdAt.getTime()) / (1000 * 60);
    const isImpossibleTravel = elapsedMinutes < 30;

    if (isImpossibleTravel) {
      await this.securityRepo.createSecurityEvent({
        tenantId,
        userId,
        type: "IMPOSSIBLE_TRAVEL",
        riskLevel: "HIGH",
        ipAddress: currentIp,
        description: `Rapid geographical transition detected (${lastAttempt.ipAddress} -> ${currentIp} within ${Math.round(elapsedMinutes)} minutes).`,
      });
      return true;
    }

    await this.securityRepo.createSecurityEvent({
      tenantId,
      userId,
      type: "SUSPICIOUS_LOGIN",
      riskLevel: "MEDIUM",
      ipAddress: currentIp,
      description: `Login detected from unfamiliar IP address: ${currentIp} (previous was ${lastAttempt.ipAddress}).`,
    });

    return true;
  }
}

export const securityEventService = new SecurityEventService();
