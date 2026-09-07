import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionBankService } from "../services/question-bank.service";
import {
  QuestionUploadResponse,
  ConfirmUploadDto,
  QuestionListItem,
} from "../types/question-bank.types";
import { QUESTION_BANKS_QUERY_KEY } from "./useQuestionBanks";
import { QUESTIONS_QUERY_KEY } from "./useQuestions";

export const QUESTION_UPLOAD_QUERY_KEY = ["question-upload"] as const;

export function useUploadPreview(uploadId: string | null | undefined) {
  return useQuery<QuestionUploadResponse, Error>({
    queryKey: [...QUESTION_UPLOAD_QUERY_KEY, "preview", uploadId],
    queryFn: () => {
      if (!uploadId) throw new Error("Upload ID is required");
      return questionBankService.getUploadPreview(uploadId);
    },
    enabled: Boolean(uploadId),
    staleTime: 10_000,
  });
}

export function useUploadQuestionFile(bankId: string) {
  return useMutation<QuestionUploadResponse, Error, File>({
    mutationFn: (file) => questionBankService.uploadQuestionFile(bankId, file),
  });
}

export function useConfirmQuestionUpload(bankId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { importedCount: number; questions: readonly QuestionListItem[] },
    Error,
    { uploadId: string; payload: ConfirmUploadDto }
  >({
    mutationFn: ({ uploadId, payload }) =>
      questionBankService.confirmUpload(bankId, uploadId, payload),
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
