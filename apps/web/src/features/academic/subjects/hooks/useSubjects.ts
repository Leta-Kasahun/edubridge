"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectService } from "../services/subject.service";
import {
  SubjectFilters,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  AssignGradesPayload,
} from "../types/subject.types";

export const SUBJECT_QUERY_KEYS = {
  all: ["academic-subjects"] as const,
  list: (filters: SubjectFilters) => ["academic-subjects", "list", filters] as const,
  detail: (id: string) => ["academic-subjects", "detail", id] as const,
};

export function useSubjects(filters: SubjectFilters = {}) {
  return useQuery({
    queryKey: SUBJECT_QUERY_KEYS.list(filters),
    queryFn: () => subjectService.getSubjects(filters),
  });
}

export function useSubjectDetail(id: string) {
  return useQuery({
    queryKey: SUBJECT_QUERY_KEYS.detail(id),
    queryFn: () => subjectService.getSubjectById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) =>
      subjectService.createSubject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) =>
      subjectService.updateSubject(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.detail(id) });
    },
  });
}

export function useToggleSubjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subjectService.toggleSubjectStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.detail(id) });
    },
  });
}

export function useAssignSubjectGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignGradesPayload }) =>
      subjectService.assignGrades(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SUBJECT_QUERY_KEYS.detail(id) });
    },
  });
}
