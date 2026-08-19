import { redis, RedisKeys } from "../../../lib/redis.js";

export class AuthCacheService {
  async blacklistToken(tokenId: string, ttlSeconds: number) {
    if (ttlSeconds <= 0) return;
    const key = RedisKeys.auth.blacklist(tokenId);
    await redis.set(key, "revoked", "EX", ttlSeconds);
  }

  async isTokenBlacklisted(tokenId: string) {
    const key = RedisKeys.auth.blacklist(tokenId);
    const result = await redis.get(key);
    return Boolean(result);
  }

  async setOtpCooldown(userId: string, purpose: string, cooldownSeconds: number) {
    const key = RedisKeys.auth.otpCooldown(userId, purpose);
    await redis.set(key, "active", "EX", cooldownSeconds);
  }

  async isOtpInCooldown(userId: string, purpose: string) {
    const key = RedisKeys.auth.otpCooldown(userId, purpose);
    const result = await redis.get(key);
    return Boolean(result);
  }

  async recordFailedAttempt(identifier: string, windowSeconds: number) {
    const key = RedisKeys.auth.loginAttempts(identifier);
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return count;
  }

  async getFailedAttempts(identifier: string) {
    const key = RedisKeys.auth.loginAttempts(identifier);
    const count = await redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  async clearFailedAttempts(identifier: string) {
    const key = RedisKeys.auth.loginAttempts(identifier);
    await redis.del(key);
  }

  async setLockout(identifier: string, durationSeconds: number) {
    const key = RedisKeys.auth.lockout(identifier);
    await redis.set(key, "locked", "EX", durationSeconds);
  }

  async isLockedOut(identifier: string) {
    const key = RedisKeys.auth.lockout(identifier);
    const result = await redis.get(key);
    return Boolean(result);
  }
}

export const authCacheService = new AuthCacheService();
