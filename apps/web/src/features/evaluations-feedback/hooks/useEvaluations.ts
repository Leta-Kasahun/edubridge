import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluationService } from "../services/evaluation.service";
import {
  ManualGradeAttemptPayload,
  SubmitQuestionFeedbackPayload,
} from "../types/evaluation.types";

export const EVALUATION_QUERY_KEYS = {
  all: ["evaluations"] as const,
  results: () => [...EVALUATION_QUERY_KEYS.all, "result"] as const,
  result: (assessmentId: string, attemptId: string) =>
    [...EVALUATION_QUERY_KEYS.results(), assessmentId, attemptId] as const,
  studentResults: (params?: unknown) =>
    [...EVALUATION_QUERY_KEYS.all, "student-results", params] as const,
};

export function useAttemptResult(assessmentId: string, attemptId: string) {
  return useQuery({
    queryKey: EVALUATION_QUERY_KEYS.result(assessmentId, attemptId),
    queryFn: () => evaluationService.getAttemptResult(assessmentId, attemptId),
    enabled: Boolean(assessmentId && attemptId),
    staleTime: 30_000,
  });
}

export function useManualGradeAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      attemptId,
      payload,
    }: {
      assessmentId: string;
      attemptId: string;
      payload: ManualGradeAttemptPayload;
    }) => evaluationService.manualGrade(assessmentId, attemptId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: EVALUATION_QUERY_KEYS.result(data.assessmentId, data.id),
      });
      queryClient.invalidateQueries({
        queryKey: EVALUATION_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["assessment-attempts"],
      });
    },
  });
}

export function useSubmitQuestionFeedback() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      payload,
    }: {
      assessmentId: string;
      payload: SubmitQuestionFeedbackPayload;
    }) => evaluationService.submitQuestionFeedback(assessmentId, payload),
  });
}

export function useStudentResults(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: EVALUATION_QUERY_KEYS.studentResults(params),
    queryFn: () => evaluationService.listStudentResults(params),
  });
}
