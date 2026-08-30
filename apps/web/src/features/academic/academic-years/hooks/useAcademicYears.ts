import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { academicYearService } from "../services/academic-year.service";
import {
  AcademicYearFilters,
  CreateAcademicYearPayload,
  UpdateAcademicYearPayload,
} from "../types/academic-year.types";

export const ACADEMIC_YEARS_QUERY_KEYS = {
  all: ["academic-years"] as const,
  list: (filters: AcademicYearFilters) =>
    [...ACADEMIC_YEARS_QUERY_KEYS.all, "list", filters] as const,
  active: () => [...ACADEMIC_YEARS_QUERY_KEYS.all, "active"] as const,
  detail: (id: string) => [...ACADEMIC_YEARS_QUERY_KEYS.all, "detail", id] as const,
};

export function useAcademicYears(filters: AcademicYearFilters = {}) {
  return useQuery({
    queryKey: ACADEMIC_YEARS_QUERY_KEYS.list(filters),
    queryFn: () => academicYearService.getAcademicYears(filters),
  });
}

export function useActiveAcademicYear() {
  return useQuery({
    queryKey: ACADEMIC_YEARS_QUERY_KEYS.active(),
    queryFn: () => academicYearService.getActiveAcademicYear(),
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAcademicYearPayload) =>
      academicYearService.createAcademicYear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEYS.all });
    },
  });
}

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAcademicYearPayload;
    }) => academicYearService.updateAcademicYear(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEYS.all });
    },
  });
}

export function useSetActiveAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearService.setActiveAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEYS.all });
    },
  });
}

export function useArchiveAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearService.archiveAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEYS.all });
    },
  });
}

export function useRestoreAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicYearService.restoreAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEYS.all });
    },
  });
}
