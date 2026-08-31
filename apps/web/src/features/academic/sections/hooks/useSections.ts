import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionService } from "../services/section.service";
import {
  SectionFilterParams,
  CreateSectionInput,
  BulkCreateSectionsInput,
  UpdateSectionInput,
} from "../types/section.types";
import { SectionStatusType } from "@/shared/constants/section.constants";

export const SECTIONS_QUERY_KEYS = {
  all: ["academic-sections"] as const,
  list: (filters: SectionFilterParams) =>
    [...SECTIONS_QUERY_KEYS.all, "list", filters] as const,
  detail: (id: string) => [...SECTIONS_QUERY_KEYS.all, "detail", id] as const,
};

export function useSections(filters: SectionFilterParams = {}) {
  return useQuery({
    queryKey: SECTIONS_QUERY_KEYS.list(filters),
    queryFn: () => sectionService.getSections(filters),
  });
}

export function useSectionDetail(id: string) {
  return useQuery({
    queryKey: SECTIONS_QUERY_KEYS.detail(id),
    queryFn: () => sectionService.getSectionById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSectionInput) =>
      sectionService.createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEYS.all });
    },
  });
}

export function useBulkCreateSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreateSectionsInput) =>
      sectionService.bulkCreateSections(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEYS.all });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSectionInput }) =>
      sectionService.updateSection(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEYS.all });
    },
  });
}

export function useUpdateSectionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SectionStatusType }) =>
      sectionService.updateSectionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEYS.all });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sectionService.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_QUERY_KEYS.all });
    },
  });
}
