export interface ActivityLogUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface ActivityLogTenant {
  id: string;
  name: string;
  code: string;
}

export interface ActivityLogItem {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: ActivityLogUser | null;
  tenant?: ActivityLogTenant | null;
}

export interface ActivityLogListResult {
  items: ActivityLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListActivityLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  action?: string;
  tenantId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityStats {
  totalCount: number;
  todayCount: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
}

