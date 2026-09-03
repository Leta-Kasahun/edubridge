import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  curriculumService,
  PaginatedCurriculaResponse,
} from "../services/curriculum.service";
import {
  CurriculumFilters,
  CurriculumDetailItem,
  CurriculumItem,
  CurriculumVersionItem,
  CreateCurriculumPayload,
  UpdateCurriculumPayload,
  CreateCurriculumVersionPayload,
  UpdateCurriculumVersionPayload,
  CurriculumStatus,
  CurriculumVersionStatus,
} from "../types/curriculum.types";

export const CURRICULA_QUERY_KEY = ["curricula"] as const;

export function useCurricula(filters: CurriculumFilters = {}) {
  return useQuery<PaginatedCurriculaResponse, Error>({
    queryKey: [...CURRICULA_QUERY_KEY, filters],
    queryFn: () => curriculumService.getCurricula(filters),
    staleTime: 30_000,
  });
}

export function useCurriculumDetails(id: string | null) {
  return useQuery<CurriculumDetailItem, Error>({
    queryKey: [...CURRICULA_QUERY_KEY, "detail", id],
    queryFn: () => {
      if (!id) throw new Error("Curriculum ID is required");
      return curriculumService.getCurriculumById(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateCurriculum() {
  const queryClient = useQueryClient();

  return useMutation<CurriculumDetailItem, Error, CreateCurriculumPayload>({
    mutationFn: (payload) => curriculumService.createCurriculum(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
    },
  });
}

export function useUpdateCurriculum(id: string) {
  const queryClient = useQueryClient();

  return useMutation<CurriculumItem, Error, UpdateCurriculumPayload>({
    mutationFn: (payload) => curriculumService.updateCurriculum(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CURRICULA_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useChangeCurriculumStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    CurriculumItem,
    Error,
    { id: string; status: CurriculumStatus }
  >({
    mutationFn: ({ id, status }) =>
      curriculumService.changeCurriculumStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CURRICULA_QUERY_KEY, "detail", variables.id],
      });
    },
  });
}

export function useCreateCurriculumVersion(curriculumId: string) {
  const queryClient = useQueryClient();

  return useMutation<CurriculumVersionItem, Error, CreateCurriculumVersionPayload>({
    mutationFn: (payload) =>
      curriculumService.createVersion(curriculumId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CURRICULA_QUERY_KEY, "detail", curriculumId],
      });
    },
  });
}

export function useUpdateCurriculumVersion(curriculumId: string, versionId: string) {
  const queryClient = useQueryClient();

  return useMutation<CurriculumVersionItem, Error, UpdateCurriculumVersionPayload>({
    mutationFn: (payload) =>
      curriculumService.updateVersion(curriculumId, versionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CURRICULA_QUERY_KEY, "detail", curriculumId],
      });
    },
  });
}

export function useChangeVersionStatus(curriculumId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    CurriculumVersionItem,
    Error,
    { versionId: string; status: CurriculumVersionStatus }
  >({
    mutationFn: ({ versionId, status }) =>
      curriculumService.changeVersionStatus(curriculumId, versionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CURRICULA_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CURRICULA_QUERY_KEY, "detail", curriculumId],
      });
    },
  });
}
