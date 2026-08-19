import { prisma, getTenantContext } from "../../../lib/prisma.js";
import {
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  AssignPermissionInput,
} from "../types/permissions.types.js";

export class PermissionRepository {
  async findAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRoleById(id: string) {
    return prisma.role.findFirst({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleByCode(code: string) {
    return prisma.role.findFirst({
      where: { code },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async createRole(data: CreateRoleInput) {
    const { permissionIds, ...roleData } = data;
    return prisma.role.create({
      data: {
        ...roleData,
        tenantId: (roleData as { tenantId?: string }).tenantId ?? (getTenantContext()?.tenantId as string),
        permissions: permissionIds && permissionIds.length > 0
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id: string, data: UpdateRoleInput) {
    const { permissionIds, ...roleData } = data;
    return prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        permissions: permissionIds
          ? {
              deleteMany: {},
              create: permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }

  async findAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });
  }

  async findPermissionByCode(code: string) {
    return prisma.permission.findUnique({
      where: { code },
    });
  }

  async createPermission(data: CreatePermissionInput) {
    return prisma.permission.create({
      data,
    });
  }

  async assignPermissionToRole(data: AssignPermissionInput) {
    return prisma.rolePermission.create({
      data: {
        roleId: data.roleId,
        permissionId: data.permissionId,
      },
      include: {
        permission: true,
        role: true,
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async findRolePermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });
  }
}

export const permissionRepository = new PermissionRepository();
