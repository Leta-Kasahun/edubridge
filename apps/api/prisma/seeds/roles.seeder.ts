import { prisma, runWithTenant } from "../../src/lib/prisma.js";
import { PERMISSIONS, ROLES } from "../data/roles.data.js";

export async function seedRolesAndPermissions(tenantId: string) {
  return runWithTenant({ tenantId }, async () => {
    const createdPermissions = await Promise.all(
      PERMISSIONS.map((perm) =>
        prisma.permission.upsert({
          where: { code: perm.code },
          update: {
            name: perm.name,
            resource: perm.resource,
            action: perm.action,
            isActive: true,
          },
          create: {
            code: perm.code,
            name: perm.name,
            resource: perm.resource,
            action: perm.action,
            isActive: true,
          },
        })
      )
    );

    const permissionMap = new Map(createdPermissions.map((p) => [p.code, p.id]));

    const seededRoles = [];

    for (const roleDef of ROLES) {
      const role = await prisma.role.upsert({
        where: {
          tenantId_code: {
            tenantId,
            code: roleDef.code,
          },
        },
        update: {
          name: roleDef.name,
          description: roleDef.description,
          isSystem: true,
          isActive: true,
        },
        create: {
          tenantId,
          name: roleDef.name,
          code: roleDef.code,
          description: roleDef.description,
          isSystem: true,
          isActive: true,
        },
      });

      const rolePermissionIds = roleDef.permissions
        .map((code) => permissionMap.get(code))
        .filter((id): id is string => Boolean(id));

      await Promise.all(
        rolePermissionIds.map((permissionId) =>
          prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId,
            },
          })
        )
      );

      seededRoles.push(role);
    }

    return seededRoles;
  });
}
