import { prisma, getTenantContext } from "../../../lib/prisma.js";
import { redis, RedisKeys } from "../../../lib/redis.js";
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../../shared/exceptions/index.js";
import { PermissionRepository, permissionRepository } from "../repository/permissions.repository.js";
import {
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  AssignPermissionInput,
} from "../types/permissions.types.js";

export class PermissionService {
  constructor(private readonly repository: PermissionRepository = permissionRepository) {}

  private async invalidateCache(roleId?: string, tenantId?: string): Promise<void> {
    const keys: string[] = [];

    if (roleId) {
      keys.push(RedisKeys.permission.rolePermissions(roleId));
    }

    if (tenantId) {
      keys.push(RedisKeys.permission.tenantRoles(tenantId));
      try {
        const pattern = RedisKeys.patterns.userPermissions(tenantId);
        const userKeys = await redis.keys(pattern);
        if (userKeys.length > 0) {
          keys.push(...userKeys);
        }
      } catch {
        // Cache scan fail-safe
      }
    }

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async getAllRoles() {
    return this.repository.findAllRoles();
  }

  async getRoleById(id: string) {
    const role = await this.repository.findRoleById(id);
    if (!role) {
      throw new NotFoundError("Role not found", "ROLE_NOT_FOUND");
    }
    return role;
  }

  async createRole(data: CreateRoleInput) {
    const existingRole = await this.repository.findRoleByCode(data.code);
    if (existingRole) {
      throw new ConflictError("Role with this code already exists", "ROLE_CODE_EXISTS");
    }

    const role = await this.repository.createRole(data);
    const tenantId = getTenantContext()?.tenantId || role.tenantId;
    await this.invalidateCache(role.id, tenantId);
    return role;
  }

  async updateRole(id: string, data: UpdateRoleInput) {
    const existingRole = await this.getRoleById(id);

    if (existingRole.isSystem && data.code && data.code !== existingRole.code) {
      throw new ForbiddenError("Cannot modify system role code", "SYSTEM_ROLE_PROTECTED");
    }

    if (data.code && data.code !== existingRole.code) {
      const duplicate = await this.repository.findRoleByCode(data.code);
      if (duplicate) {
        throw new ConflictError("Role with this code already exists", "ROLE_CODE_EXISTS");
      }
    }

    const updatedRole = await this.repository.updateRole(id, data);
    const tenantId = getTenantContext()?.tenantId || existingRole.tenantId;
    await this.invalidateCache(id, tenantId);
    return updatedRole;
  }

  async deleteRole(id: string) {
    const existingRole = await this.getRoleById(id);

    if (existingRole.isSystem) {
      throw new ForbiddenError("System roles cannot be deleted", "SYSTEM_ROLE_PROTECTED");
    }

    const deletedRole = await this.repository.deleteRole(id);
    const tenantId = getTenantContext()?.tenantId || existingRole.tenantId;
    await this.invalidateCache(id, tenantId);
    return deletedRole;
  }

  async getAllPermissions() {
    return this.repository.findAllPermissions();
  }

  async createPermission(data: CreatePermissionInput) {
    const existingPermission = await this.repository.findPermissionByCode(data.code);
    if (existingPermission) {
      throw new ConflictError("Permission with this code already exists", "PERMISSION_CODE_EXISTS");
    }
    return this.repository.createPermission(data);
  }

  async assignPermissionToRole(data: AssignPermissionInput) {
    const role = await this.getRoleById(data.roleId);
    const result = await this.repository.assignPermissionToRole(data);
    const tenantId = getTenantContext()?.tenantId || role.tenantId;
    await this.invalidateCache(data.roleId, tenantId);
    return result;
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const role = await this.getRoleById(roleId);
    const result = await this.repository.removePermissionFromRole(roleId, permissionId);
    const tenantId = getTenantContext()?.tenantId || role.tenantId;
    await this.invalidateCache(roleId, tenantId);
    return result;
  }

  async getRolePermissions(roleId: string) {
    await this.getRoleById(roleId);
    const cacheKey = RedisKeys.permission.rolePermissions(roleId);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const permissions = await this.repository.findRolePermissions(roleId);
    await redis.set(cacheKey, JSON.stringify(permissions), "EX", 3600);
    return permissions;
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const tenantContext = getTenantContext();
    const tenantId = tenantContext?.tenantId;

    if (!tenantId) {
      throw new BadRequestError("Tenant context is required for permission check", "TENANT_REQUIRED");
    }

    const cacheKey = RedisKeys.permission.userPermissions(tenantId, userId);
    const cachedPermissions = await redis.get(cacheKey);

    let userPermissions: string[];

    if (cachedPermissions) {
      userPermissions = JSON.parse(cachedPermissions);
    } else {
      const membership = await prisma.tenantMembership.findFirst({
        where: {
          tenantId,
          userId,
        },
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
        },
      });

      if (!membership || membership.status !== "ACTIVE") {
        return false;
      }

      const now = new Date();
      const permissionsSet = new Set<string>();

      for (const membershipRole of membership.roles) {
        if (membershipRole.expiresAt && membershipRole.expiresAt < now) {
          continue;
        }

        const role = membershipRole.role;
        if (!role.isActive) {
          continue;
        }

        for (const rolePerm of role.permissions) {
          if (rolePerm.permission.isActive) {
            permissionsSet.add(`${rolePerm.permission.resource}:${rolePerm.permission.action}`);
          }
        }
      }

      userPermissions = Array.from(permissionsSet);
      await redis.set(cacheKey, JSON.stringify(userPermissions), "EX", 300);
    }

    return (
      userPermissions.includes(`${resource}:${action}`) ||
      userPermissions.includes(`${resource}:*`) ||
      userPermissions.includes("*:*")
    );
  }
}

export const permissionService = new PermissionService();
