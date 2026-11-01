export type ActivityResource =
  | "STUDENT"
  | "TEACHER"
  | "ENROLLMENT"
  | "ACADEMIC"
  | "CURRICULUM"
  | "ASSESSMENT"
  | "ATTENDANCE"
  | "MASTERY"
  | "GRADE"
  | "PARENT"
  | "USER_PERMISSION"
  | "CONFIGURATION"
  | "AUTH"
  | "SECURITY";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "ASSIGN"
  | "REASSIGN"
  | "ENROLL"
  | "GRADE"
  | "PUBLISH"
  | "STATUS_CHANGE"
  | "PASSWORD_RESET"
  | "IMPORT"
  | "EXPORT";

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
  createdAt: Date;
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

export interface RecordActivityInput {
  tenantId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export interface ActivityStats {
  totalCount: number;
  todayCount: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
}

