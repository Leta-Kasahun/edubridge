export type PermissionAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "MANAGE"
  | (string & {});

export type PermissionResource =
  | "role"
  | "permission"
  | "lookup"
  | "student"
  | "class"
  | "teacher"
  | "attendance"
  | "exam"
  | "tenant"
  | "user"
  | (string & {});

export interface Permission {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly resource: string;
  readonly action: string;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RolePermission {
  readonly roleId: string;
  readonly permissionId: string;
  readonly role?: Role;
  readonly permission?: Permission;
  readonly createdAt?: string;
}

export interface Role {
  readonly id: string;
  readonly tenantId?: string | null;
  readonly name: string;
  readonly code: string;
  readonly description?: string | null;
  readonly isSystem: boolean;
  readonly isActive: boolean;
  readonly permissions?: readonly RolePermission[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateRolePayload {
  readonly name: string;
  readonly code: string;
  readonly description?: string | null;
  readonly isSystem?: boolean;
  readonly isActive?: boolean;
  readonly permissionIds?: readonly string[];
}

export interface UpdateRolePayload {
  readonly name?: string;
  readonly code?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
  readonly permissionIds?: readonly string[];
}

export interface CreatePermissionPayload {
  readonly code: string;
  readonly name: string;
  readonly description?: string | null;
  readonly resource: string;
  readonly action: string;
  readonly isActive?: boolean;
}

export interface AssignPermissionPayload {
  readonly roleId: string;
  readonly permissionId: string;
}
