import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examContextService } from "../services/exam-context.service";
import {
  ExamContextFilters,
  ExamContextItem,
  CreateExamContextDto,
  UpdateExamContextDto,
  PaginatedResponse,
} from "../types/question-bank.types";

export const EXAM_CONTEXTS_QUERY_KEY = ["exam-contexts"] as const;

export function useExamContexts(filters: ExamContextFilters = {}) {
  return useQuery<PaginatedResponse<ExamContextItem>, Error>({
    queryKey: [...EXAM_CONTEXTS_QUERY_KEY, filters],
    queryFn: () => examContextService.getExamContexts(filters),
    staleTime: 30_000,
  });
}

export function useExamContext(id: string | null | undefined) {
  return useQuery<ExamContextItem, Error>({
    queryKey: [...EXAM_CONTEXTS_QUERY_KEY, "detail", id],
    queryFn: () => {
      if (!id) throw new Error("Exam context ID is required");
      return examContextService.getExamContextById(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateExamContext() {
  const queryClient = useQueryClient();

  return useMutation<ExamContextItem, Error, CreateExamContextDto>({
    mutationFn: (payload) => examContextService.createExamContext(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_CONTEXTS_QUERY_KEY });
    },
  });
}

export function useUpdateExamContext(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ExamContextItem, Error, UpdateExamContextDto>({
    mutationFn: (payload) => examContextService.updateExamContext(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_CONTEXTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...EXAM_CONTEXTS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useDeleteExamContext() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => examContextService.deleteExamContext(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXAM_CONTEXTS_QUERY_KEY });
    },
  });
}
