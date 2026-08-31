import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gradeService } from "../services/grade.service";
import { GradeFilters, CreateGradePayload } from "../types/grade.types";

export const GRADES_QUERY_KEYS = {
  all: ["academic-grades"] as const,
  list: (filters: GradeFilters) =>
    [...GRADES_QUERY_KEYS.all, "list", filters] as const,
  detail: (id: string, academicYearId?: string) =>
    [...GRADES_QUERY_KEYS.all, "detail", id, academicYearId] as const,
};

export function useGrades(filters: GradeFilters = {}) {
  return useQuery({
    queryKey: GRADES_QUERY_KEYS.list(filters),
    queryFn: () => gradeService.getGrades(filters),
  });
}

export function useGradeDetail(id: string, academicYearId?: string) {
  return useQuery({
    queryKey: GRADES_QUERY_KEYS.detail(id, academicYearId),
    queryFn: () => gradeService.getGradeById(id, academicYearId),
    enabled: Boolean(id),
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGradePayload) => gradeService.createGrade(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEYS.all });
    },
  });
}

export function useToggleGradeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gradeService.toggleActiveStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADES_QUERY_KEYS.all });
    },
  });
}
