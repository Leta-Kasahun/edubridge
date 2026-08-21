import { RouteDefinition, routeRegistry } from "../../docs/route.registry.js";
import {
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  assignPermissionSchema,
} from "./schemas/permissions.schema.js";

const permissionRouteDefinitions: RouteDefinition[] = [
  {
    path: "/roles",
    method: "GET",
    description: "List roles",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id",
    method: "GET",
    description: "Get role by ID",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles",
    method: "POST",
    requestBody: createRoleSchema,
    description: "Create role",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id",
    method: "PUT",
    requestBody: updateRoleSchema,
    description: "Update role",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id",
    method: "DELETE",
    description: "Delete role",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id/permissions",
    method: "GET",
    description: "List role permissions",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id/permissions",
    method: "POST",
    requestBody: assignPermissionSchema,
    description: "Assign permission to role",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/roles/:id/permissions/:permissionId",
    method: "DELETE",
    description: "Remove permission from role",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/permissions",
    method: "GET",
    description: "List permissions",
    tags: ["Permissions"],
    security: true,
  },
  {
    path: "/permissions",
    method: "POST",
    requestBody: createPermissionSchema,
    description: "Create permission",
    tags: ["Permissions"],
    security: true,
  },
];

export const registerPermissionRoutes = () => {
  for (const definition of permissionRouteDefinitions) {
    routeRegistry.register(definition);
  }
};

export const registerPermissionDocs = registerPermissionRoutes;
