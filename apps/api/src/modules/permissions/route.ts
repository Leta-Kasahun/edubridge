import { Router } from "express";
import { authenticate, requireTenant, requirePermission, validate } from "../../middleware/index.js";
import { permissionController } from "./controllers/permissions.controller.js";
import {
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  assignPermissionSchema,
} from "./schemas/permissions.schema.js";

const router = Router();

router.use(authenticate);
router.use(requireTenant);

router.get(
  "/roles",
  requirePermission("READ", "role"),
  permissionController.getAllRoles
);

router.get(
  "/roles/:id",
  requirePermission("READ", "role"),
  permissionController.getRoleById
);

router.post(
  "/roles",
  requirePermission("CREATE", "role"),
  validate(createRoleSchema),
  permissionController.createRole
);

router.put(
  "/roles/:id",
  requirePermission("UPDATE", "role"),
  validate(updateRoleSchema),
  permissionController.updateRole
);

router.delete(
  "/roles/:id",
  requirePermission("DELETE", "role"),
  permissionController.deleteRole
);

router.get(
  "/permissions",
  requirePermission("READ", "permission"),
  permissionController.getAllPermissions
);

router.post(
  "/permissions",
  requirePermission("CREATE", "permission"),
  validate(createPermissionSchema),
  permissionController.createPermission
);

router.get(
  "/roles/:id/permissions",
  requirePermission("READ", "role"),
  permissionController.getRolePermissions
);

router.post(
  "/roles/:id/permissions",
  requirePermission("MANAGE", "role"),
  validate(assignPermissionSchema.partial({ roleId: true })),
  permissionController.assignPermissionToRole
);

router.delete(
  "/roles/:id/permissions/:permissionId",
  requirePermission("MANAGE", "role"),
  permissionController.removePermissionFromRole
);

export { router as permissionRouter };
