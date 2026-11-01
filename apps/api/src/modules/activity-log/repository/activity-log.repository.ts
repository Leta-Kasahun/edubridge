import { prisma, runWithoutTenant } from "../../../lib/prisma.js";
import { Prisma } from "../../../generated/prisma/client.js";
import {
  ActivityLogItem,
  RecordActivityInput,
  ActivityStats,
} from "../types/activity-log.types.js";

export interface FindActivityLogsOptions {
  tenantId?: string | null;
  userId?: string;
  resource?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export class ActivityLogRepository {
  async create(data: RecordActivityInput): Promise<ActivityLogItem> {
    return runWithoutTenant(async () => {
      const record = await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId || null,
          userId: data.userId || null,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId || null,
          metadata: (data.metadata as Prisma.InputJsonValue) ?? undefined,
          ipAddress: data.ipAddress || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      return {
        ...record,
        metadata: (record.metadata as Record<string, unknown> | null) ?? null,
      };
    });
  }

  async findMany(
    options: FindActivityLogsOptions
  ): Promise<{ items: ActivityLogItem[]; total: number }> {
    const {
      tenantId,
      userId,
      resource,
      action,
      search,
      startDate,
      endDate,
      page,
      limit,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (tenantId !== undefined && tenantId !== null) {
      where.tenantId = tenantId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (resource) {
      where.resource = {
        equals: resource.toUpperCase(),
        mode: "insensitive",
      };
    }

    if (action) {
      where.action = {
        equals: action.toUpperCase(),
        mode: "insensitive",
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        if (endDate.length <= 10) {
          end.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { resource: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    return runWithoutTenant(async () => {
      const [records, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
            tenant: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      const items: ActivityLogItem[] = records.map((r) => ({
        ...r,
        metadata: (r.metadata as Record<string, unknown> | null) ?? null,
      }));

      return { items, total };
    });
  }

  async getStats(tenantId?: string | null): Promise<ActivityStats> {
    return runWithoutTenant(async () => {
      const where: Prisma.AuditLogWhereInput = {};
      if (tenantId !== undefined && tenantId !== null) {
        where.tenantId = tenantId;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [totalCount, todayCount, rawResources, rawActions] =
        await Promise.all([
          prisma.auditLog.count({ where }),
          prisma.auditLog.count({
            where: {
              ...where,
              createdAt: { gte: todayStart },
            },
          }),
          prisma.auditLog.groupBy({
            by: ["resource"],
            where,
            _count: { resource: true },
          }),
          prisma.auditLog.groupBy({
            by: ["action"],
            where,
            _count: { action: true },
          }),
        ]);

      const byResource: Record<string, number> = {};
      for (const item of rawResources) {
        byResource[item.resource] = item._count.resource;
      }

      const byAction: Record<string, number> = {};
      for (const item of rawActions) {
        byAction[item.action] = item._count.action;
      }

      return {
        totalCount,
        todayCount,
        byResource,
        byAction,
      };
    });
  }
}

export const activityLogRepository = new ActivityLogRepository();

