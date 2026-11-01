"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { activityLogService } from "../services/activity-log.service";
import { ListActivityLogsParams } from "../types/activity-log.types";

export const ACTIVITY_LOGS_QUERY_KEY = ["activity-logs"] as const;

export function useActivityLogs(params?: ListActivityLogsParams) {
  return useQuery({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEY, "list", params],
    queryFn: () => activityLogService.list(params),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useInfiniteActivityLogs(params?: Omit<ListActivityLogsParams, "page">) {
  return useInfiniteQuery({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEY, "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      activityLogService.list({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useActivityStats() {
  return useQuery({
    queryKey: [...ACTIVITY_LOGS_QUERY_KEY, "stats"],
    queryFn: () => activityLogService.getStats(),
    staleTime: 60 * 1000,
  });
}

