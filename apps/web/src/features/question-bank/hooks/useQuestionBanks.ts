import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankService } from "../services/question-bank.service";
import {
  QuestionBankFilters,
  QuestionBankItem,
  QuestionBankDetailItem,
  CreateQuestionBankDto,
  UpdateQuestionBankDto,
  QuestionBankStatus,
  PaginatedResponse,
} from "../types/question-bank.types";

export const QUESTION_BANKS_QUERY_KEY = ["question-banks"] as const;

export function useQuestionBanks(filters: QuestionBankFilters = {}) {
  return useQuery<PaginatedResponse<QuestionBankItem>, Error>({
    queryKey: [...QUESTION_BANKS_QUERY_KEY, filters],
    queryFn: () => questionBankService.getQuestionBanks(filters),
    staleTime: 30_000,
  });
}

export function useQuestionBank(id: string | null | undefined) {
  return useQuery<QuestionBankDetailItem, Error>({
    queryKey: [...QUESTION_BANKS_QUERY_KEY, "detail", id],
    queryFn: () => {
      if (!id) throw new Error("Question bank ID is required");
      return questionBankService.getQuestionBankById(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateQuestionBank() {
  const queryClient = useQueryClient();

  return useMutation<QuestionBankItem, Error, CreateQuestionBankDto>({
    mutationFn: (payload) => questionBankService.createQuestionBank(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_QUERY_KEY });
    },
  });
}

export function useUpdateQuestionBank(id: string) {
  const queryClient = useQueryClient();

  return useMutation<QuestionBankItem, Error, UpdateQuestionBankDto>({
    mutationFn: (payload) => questionBankService.updateQuestionBank(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...QUESTION_BANKS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useUpdateQuestionBankStatus() {
  const queryClient = useQueryClient();

  return useMutation<QuestionBankItem, Error, { id: string; status: QuestionBankStatus }>({
    mutationFn: ({ id, status }) =>
      questionBankService.updateQuestionBank(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...QUESTION_BANKS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useDeleteQuestionBank() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => questionBankService.deleteQuestionBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUESTION_BANKS_QUERY_KEY });
    },
  });
}
