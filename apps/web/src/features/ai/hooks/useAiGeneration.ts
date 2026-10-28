"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiService } from "../services/ai.service";
import type {
  GenerateQuestionsDto,
  GenerateContentDto,
  GenerateQuestionsResponse,
  GenerateContentResponse,
  AiJobItem,
} from "../types/ai.types";
import { PaginatedResponse } from "@/shared/types";

export const AI_QUERY_KEYS = {
  all: ["ai"] as const,
  jobs: () => [...AI_QUERY_KEYS.all, "jobs"] as const,
  job: (id: string) => [...AI_QUERY_KEYS.jobs(), id] as const,
};

export function useGenerateQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation<GenerateQuestionsResponse, Error, GenerateQuestionsDto>({
    mutationFn: (dto) => aiService.generateQuestions(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-banks"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.jobs() });
    },
  });
}

export function useGenerateContentMutation() {
  const queryClient = useQueryClient();

  return useMutation<GenerateContentResponse, Error, GenerateContentDto>({
    mutationFn: (dto) => aiService.generateContent(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-content"] });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.jobs() });
    },
  });
}

export function useAiJobQuery(jobId: string | null | undefined) {
  return useQuery<AiJobItem, Error>({
    queryKey: AI_QUERY_KEYS.job(jobId ?? ""),
    queryFn: () => aiService.getJob(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 2000 : false;
    },
  });
}

export function useAiJobsQuery(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<AiJobItem>, Error>({
    queryKey: [...AI_QUERY_KEYS.jobs(), page, limit],
    queryFn: () => aiService.listJobs(page, limit),
  });
}
