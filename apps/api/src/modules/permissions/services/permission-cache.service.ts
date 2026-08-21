import { redis, RedisKeys } from "../../../lib/redis.js";

export class PermissionCacheService {
  async cacheRolePermissions(roleId: string, permissions: unknown, ttl = 3600) {
    const key = RedisKeys.permission.rolePermissions(roleId);
    await redis.set(key, JSON.stringify(permissions), "EX", ttl);
  }

  async getCachedPermissions(key: string) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateRoleCache(roleId: string, tenantId?: string) {
    const keys = [RedisKeys.permission.rolePermissions(roleId)];
    if (tenantId) {
      keys.push(RedisKeys.permission.tenantRoles(tenantId));
      try {
        const pattern = RedisKeys.patterns.userPermissions(tenantId);
        const userKeys = await redis.keys(pattern);
        if (userKeys.length > 0) {
          keys.push(...userKeys);
        }
      } catch (err) {
        void err;
      }
    }
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async invalidateUserCache(tenantId: string, userId: string) {
    const keys = [
      RedisKeys.permission.userPermissions(tenantId, userId),
      RedisKeys.permission.userRoles(tenantId, userId),
    ];
    await redis.del(...keys);
  }

  async invalidateTenantCache(tenantId: string) {
    const keys = [RedisKeys.permission.tenantRoles(tenantId)];
    try {
      const pattern = RedisKeys.patterns.userPermissions(tenantId);
      const userKeys = await redis.keys(pattern);
      if (userKeys.length > 0) {
        keys.push(...userKeys);
      }
    } catch (err) {
      void err;
    }
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const permissionCacheService = new PermissionCacheService();
