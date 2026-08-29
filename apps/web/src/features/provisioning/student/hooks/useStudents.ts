import { useQuery } from "@tanstack/react-query";
import { studentProvisioningService } from "../services/student-provisioning.service";
import { StudentQueryFilters } from "../types/student-provisioning.types";
import { STUDENT_PROVISIONING_QUERY_KEYS } from "./useAcademicStructure";

export function useStudents(filters: StudentQueryFilters = {}) {
  return useQuery({
    queryKey: STUDENT_PROVISIONING_QUERY_KEYS.list(filters),
    queryFn: () => studentProvisioningService.getStudents(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: STUDENT_PROVISIONING_QUERY_KEYS.detail(id),
    queryFn: () => studentProvisioningService.getStudentById(id),
    enabled: Boolean(id),
  });
}
