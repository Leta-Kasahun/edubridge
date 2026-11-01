import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  ActivityLogListResult,
  ActivityStats,
  ListActivityLogsParams,
} from "../types/activity-log.types";

const BASE = API_ENDPOINTS.ACTIVITY_LOGS;

export const activityLogService = {
  list: async (params?: ListActivityLogsParams): Promise<ActivityLogListResult> => {
    const res = await apiClient.get<ApiResponse<ActivityLogListResult>>(BASE.BASE, {
      params,
    });
    return res.data.data;
  },

  getStats: async (): Promise<ActivityStats> => {
    const res = await apiClient.get<ApiResponse<ActivityStats>>(BASE.STATS);
    return res.data.data;
  },
};

