import { generateOTP, hashOTP, verifyOTPHash } from "../../../shared/auth/otp.js";
import { otpRepository, OtpRepository } from "../repository/otp.repository.js";
import { securityRepository, SecurityRepository } from "../repository/security.repository.js";
import { authCacheService, AuthCacheService } from "./auth-cache.service.js";
import { OTPPurpose } from "../types/auth.types.js";
import { BadRequestError } from "../../../shared/exceptions/bad-request-error.js";
import { AUTH_CONSTANTS } from "../../../shared/constants/auth.constants.js";

export class OtpService {
  constructor(
    private readonly otpRepo: OtpRepository = otpRepository,
    private readonly securityRepo: SecurityRepository = securityRepository,
    private readonly cacheSvc: AuthCacheService = authCacheService
  ) {}

  async generateAndSaveOtp(userId: string, purpose: OTPPurpose, tenantId?: string) {
    const isCoolingDown = await this.cacheSvc.isOtpInCooldown(userId, purpose);
    if (isCoolingDown) {
      throw new BadRequestError("Please wait before requesting another verification code", "OTP_COOLDOWN_ACTIVE");
    }

    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    const expiryMinutes = policy?.otpExpiryMinutes || AUTH_CONSTANTS.OTP.DEFAULT_EXPIRY_MINUTES;
    const maxResendPerHour = policy?.otpMaxResendPerHour || AUTH_CONSTANTS.OTP.MAX_RESEND_PER_HOUR;
    const cooldownSeconds = policy?.otpResendCooldownSeconds || AUTH_CONSTANTS.OTP.RESEND_COOLDOWN_SECONDS;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentResends = await this.otpRepo.countRecentOtpResends(userId, purpose, oneHourAgo);
    if (recentResends >= maxResendPerHour) {
      throw new BadRequestError("Too many OTP requests. Please try again later.", "OTP_RATE_LIMITED");
    }

    const plainOtp = generateOTP(AUTH_CONSTANTS.OTP.LENGTH);
    const codeHash = hashOTP(plainOtp);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.otpRepo.createOtp({
      userId,
      codeHash,
      purpose,
      expiresAt,
    });

    await this.cacheSvc.setOtpCooldown(userId, purpose, cooldownSeconds);

    return { plainOtp, expiresAt, expiryMinutes };
  }

  async verifyOtp(userId: string, plainOtp: string, purpose: OTPPurpose, tenantId?: string) {
    const validOtp = await this.otpRepo.findValidOtp(userId, purpose);
    if (!validOtp) {
      throw new BadRequestError("Invalid or expired OTP", "OTP_EXPIRED");
    }

    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    const maxAttempts = policy?.otpMaxAttempts || AUTH_CONSTANTS.OTP.MAX_ATTEMPTS;

    if (validOtp.attemptCount >= maxAttempts) {
      await this.otpRepo.consumeOtp(validOtp.id);
      throw new BadRequestError("Maximum OTP attempts exceeded. Please request a new code.", "OTP_MAX_ATTEMPTS");
    }

    const isValid = verifyOTPHash(plainOtp, validOtp.codeHash);
    if (!isValid) {
      await this.otpRepo.incrementOtpAttempts(validOtp.id);
      throw new BadRequestError("Incorrect verification code", "OTP_INVALID");
    }

    await this.otpRepo.consumeOtp(validOtp.id);
    return true;
  }

  async verifySetupOtp(userId: string, plainOtp: string, tenantId?: string) {
    const validOtp = await this.otpRepo.findValidSetupOtp(userId);
    if (!validOtp) {
      throw new BadRequestError("Invalid or expired verification code", "OTP_EXPIRED");
    }

    const policy = tenantId ? await this.securityRepo.findSecurityPolicy(tenantId) : null;
    const maxAttempts = policy?.otpMaxAttempts || AUTH_CONSTANTS.OTP.MAX_ATTEMPTS;

    if (validOtp.attemptCount >= maxAttempts) {
      await this.otpRepo.consumeOtp(validOtp.id);
      throw new BadRequestError("Maximum verification code attempts exceeded. Please request a new code.", "OTP_MAX_ATTEMPTS");
    }

    const isValid = verifyOTPHash(plainOtp, validOtp.codeHash);
    if (!isValid) {
      await this.otpRepo.incrementOtpAttempts(validOtp.id);
      throw new BadRequestError("Incorrect verification code", "OTP_INVALID");
    }

    await this.otpRepo.consumeOtp(validOtp.id);
    return true;
  }
}

export const otpService = new OtpService();
