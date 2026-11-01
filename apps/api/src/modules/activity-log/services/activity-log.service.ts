import {
  activityLogRepository,
  ActivityLogRepository,
} from "../repository/activity-log.repository.js";
import {
  ActivityLogItem,
  ActivityLogListResult,
  ActivityStats,
  RecordActivityInput,
} from "../types/activity-log.types.js";
import { ActivityLogQueryDto } from "../schemas/activity-log.schema.js";
import { ForbiddenError } from "../../../shared/exceptions/forbidden-error.js";

export class ActivityLogService {
  constructor(
    private readonly repo: ActivityLogRepository = activityLogRepository
  ) {}

  async listActivities(
    query: ActivityLogQueryDto,
    currentUser: { userId: string; tenantId?: string; roles: string[] }
  ): Promise<ActivityLogListResult> {
    const isSystemAdmin = currentUser.roles.includes("SYSTEM_ADMIN");

    if (!isSystemAdmin && !currentUser.tenantId) {
      throw new ForbiddenError(
        "No assigned school associated with your account.",
        "TENANT_REQUIRED"
      );
    }

    const targetTenantId = isSystemAdmin ? query.tenantId : currentUser.tenantId;

    const { items, total } = await this.repo.findMany({
      tenantId: targetTenantId,
      userId: query.userId,
      resource: query.resource,
      action: query.action,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    });

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async getStats(currentUser: {
    tenantId?: string;
    roles: string[];
  }): Promise<ActivityStats> {
    const isSystemAdmin = currentUser.roles.includes("SYSTEM_ADMIN");
    const targetTenantId = isSystemAdmin ? undefined : currentUser.tenantId;

    return this.repo.getStats(targetTenantId);
  }

  async record(data: RecordActivityInput): Promise<ActivityLogItem> {
    return this.repo.create(data);
  }
}

export const activityLogService = new ActivityLogService();

