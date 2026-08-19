export interface Permission {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id?: string;
  tenantId?: string;
  name: string;
  code: string;
  description?: string | null;
  isSystem?: boolean;
  isActive?: boolean;
  permissions?: RolePermission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  role?: Role;
  permission?: Permission;
  createdAt?: Date;
}

export interface CreateRoleInput {
  name: string;
  code: string;
  description?: string | null;
  isSystem?: boolean;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  code?: string;
  description?: string | null;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface CreatePermissionInput {
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  isActive?: boolean;
}

export interface AssignPermissionInput {
  roleId: string;
  permissionId: string;
}

export interface CheckPermissionInput {
  userId: string;
  resource: string;
  action: string;
}
