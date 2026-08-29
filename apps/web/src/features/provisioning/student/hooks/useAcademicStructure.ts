import { useQuery } from "@tanstack/react-query";
import { studentProvisioningService } from "../services/student-provisioning.service";
import { StudentQueryFilters } from "../types/student-provisioning.types";

export const STUDENT_PROVISIONING_QUERY_KEYS = {
  all: ["provisioning", "students"] as const,
  academicStructure: (academicYearId?: string) =>
    [...STUDENT_PROVISIONING_QUERY_KEYS.all, "academic-structure", academicYearId] as const,
  lists: () => [...STUDENT_PROVISIONING_QUERY_KEYS.all, "list"] as const,
  list: (filters: StudentQueryFilters) =>
    [...STUDENT_PROVISIONING_QUERY_KEYS.lists(), filters] as const,
  details: () => [...STUDENT_PROVISIONING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...STUDENT_PROVISIONING_QUERY_KEYS.details(), id] as const,
};

export function useAcademicStructure(academicYearId?: string) {
  return useQuery({
    queryKey: STUDENT_PROVISIONING_QUERY_KEYS.academicStructure(academicYearId),
    queryFn: () => studentProvisioningService.getAcademicStructure(academicYearId),
  });
}
