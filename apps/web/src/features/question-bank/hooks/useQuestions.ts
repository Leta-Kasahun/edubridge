import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionBankService } from "../services/question-bank.service";
import {
  QuestionListItem,
  QuestionDetailItem,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionStatus,
  QuestionFilters,
  PaginatedResponse,
} from "../types/question-bank.types";
import { QUESTION_BANKS_QUERY_KEY } from "./useQuestionBanks";

export const QUESTIONS_QUERY_KEY = ["questions"] as const;

export function useQuestions(bankId: string, filters: QuestionFilters = {}) {
  return useQuery<PaginatedResponse<QuestionListItem>, Error>({
    queryKey: [...QUESTIONS_QUERY_KEY, bankId, filters],
    queryFn: () => questionBankService.getQuestions(bankId, filters),
    enabled: Boolean(bankId),
    staleTime: 30_000,
  });
}

export function useQuestion(id: string | null | undefined) {
  return useQuery<QuestionDetailItem, Error>({
    queryKey: [...QUESTIONS_QUERY_KEY, "detail", id],
    queryFn: () => {
      if (!id) throw new Error("Question ID is required");
      return questionBankService.getQuestionById(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateQuestion(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<QuestionDetailItem, Error, CreateQuestionDto>({
    mutationFn: (payload) => questionBankService.createQuestion(bankId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

export function useCreateBatchQuestions(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<readonly QuestionListItem[], Error, readonly CreateQuestionDto[]>({
    mutationFn: (questions) => questionBankService.createBatchQuestions(bankId, questions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateQuestion(bankId: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation<QuestionDetailItem, Error, UpdateQuestionDto>({
    mutationFn: (payload) => questionBankService.updateQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useUpdateQuestionStatus(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<QuestionDetailItem, Error, { id: string; status: QuestionStatus }>({
    mutationFn: ({ id, status }) => questionBankService.updateQuestion(id, { status }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function usePublishQuestion(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<QuestionDetailItem, Error, string>({
    mutationFn: (id) => questionBankService.publishQuestion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useResolveQuestionReport(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    QuestionDetailItem,
    Error,
    { questionId: string; reportId: string }
  >({
    mutationFn: ({ questionId, reportId }) =>
      questionBankService.resolveQuestionReport(questionId, reportId),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, "detail", questionId],
      });
    },
  });
}

export function useDeleteQuestion(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => questionBankService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

export function useBulkPublishQuestions(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, readonly string[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => questionBankService.publishQuestion(id)));
      return ids.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

export function useBulkArchiveQuestions(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, readonly string[]>({
    mutationFn: async (ids) => {
      await Promise.all(
        ids.map((id) => questionBankService.updateQuestion(id, { status: "ARCHIVED" }))
      );
      return ids.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

export function useBulkDeleteQuestions(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, readonly string[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => questionBankService.deleteQuestion(id)));
      return ids.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...QUESTIONS_QUERY_KEY, bankId],
      });
      queryClient.invalidateQueries({
        queryKey: QUESTION_BANKS_QUERY_KEY,
      });
    },
  });
}

