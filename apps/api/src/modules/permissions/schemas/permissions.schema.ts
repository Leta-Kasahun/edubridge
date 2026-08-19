import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  code: z.string().min(1).max(50).trim().regex(/^[A-Z0-9_-]+$/i),
  description: z.string().max(255).trim().optional().nullable(),
  isSystem: z.boolean().optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  code: z.string().min(1).max(50).trim().regex(/^[A-Z0-9_-]+$/i).optional(),
  description: z.string().max(255).trim().optional().nullable(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const createPermissionSchema = z.object({
  code: z.string().min(1).max(100).trim().regex(/^[A-Z0-9_:-]+$/i),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(255).trim().optional().nullable(),
  resource: z.string().min(1).max(50).trim().toLowerCase(),
  action: z.string().min(1).max(50).trim().toLowerCase(),
  isActive: z.boolean().optional(),
});

export const assignPermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
});

export const checkPermissionSchema = z.object({
  userId: z.string().uuid(),
  resource: z.string().min(1).trim().toLowerCase(),
  action: z.string().min(1).trim().toLowerCase(),
});
