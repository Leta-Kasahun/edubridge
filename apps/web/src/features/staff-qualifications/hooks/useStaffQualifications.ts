import { useQuery } from "@tanstack/react-query";
import { staffQualificationsService } from "../services/staff-qualifications.service";
import { StaffDirectoryFilters } from "../types/staff-qualifications.types";

export const STAFF_QUALIFICATIONS_QUERY_KEY = ["staff-qualifications"] as const;

export function useStaffQualificationsDirectory(filters: StaffDirectoryFilters = {}) {
  return useQuery({
    queryKey: [...STAFF_QUALIFICATIONS_QUERY_KEY, filters],
    queryFn: () => staffQualificationsService.getDirectory(filters),
    staleTime: 1000 * 60 * 3,
  });
}
