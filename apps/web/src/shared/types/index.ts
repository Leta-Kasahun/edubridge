export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  meta: PaginationMeta;
}

export interface UserMembershipInfo {
  tenantId: string;
  tenantName: string;
  roles: string[];
}

export interface AuthUser {
  id: string;
  email: string | null;
  username?: string | null;
  firstName?: string;
  lastName?: string;
  roles: string[];
  tenantId?: string;
  tenantName?: string;
  status?: string;
  memberships?: UserMembershipInfo[];
}
