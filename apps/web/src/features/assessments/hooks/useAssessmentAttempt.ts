import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attemptService } from "../services/attempt.service";
import { ManualGradeAttemptPayload } from "../types/assessment.types";

export const ATTEMPT_QUERY_KEYS = {
  all: ["assessment-attempts"] as const,
  results: () => [...ATTEMPT_QUERY_KEYS.all, "result"] as const,
  result: (assessmentId: string, attemptId: string) =>
    [...ATTEMPT_QUERY_KEYS.results(), assessmentId, attemptId] as const,
  lists: () => [...ATTEMPT_QUERY_KEYS.all, "list"] as const,
  list: (assessmentId: string, params: Record<string, unknown>) =>
    [...ATTEMPT_QUERY_KEYS.lists(), assessmentId, params] as const,
  studentResults: (params: { page?: number; limit?: number } = {}) =>
    [...ATTEMPT_QUERY_KEYS.all, "student-results", params] as const,
};

export function useStartAttempt() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      assignmentId,
    }: {
      assessmentId: string;
      assignmentId?: string;
    }) => attemptService.startAttempt(assessmentId, assignmentId),
  });
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      attemptId,
      questionVersionId,
      response,
    }: {
      assessmentId: string;
      attemptId: string;
      questionVersionId: string;
      response: unknown;
    }) =>
      attemptService.saveAnswer(
        assessmentId,
        attemptId,
        questionVersionId,
        response
      ),
  });
}

export function useBatchSaveAnswers() {
  return useMutation({
    mutationFn: ({
      assessmentId,
      attemptId,
      answers,
    }: {
      assessmentId: string;
      attemptId: string;
      answers: Array<{ questionVersionId: string; response: unknown }>;
    }) =>
      attemptService.batchSaveAnswers(assessmentId, attemptId, answers),
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      attemptId,
      answers,
    }: {
      assessmentId: string;
      attemptId: string;
      answers?: Array<{ questionVersionId: string; response: unknown }>;
    }) => attemptService.submitAttempt(assessmentId, attemptId, answers),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ATTEMPT_QUERY_KEYS.result(data.assessmentId, data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ATTEMPT_QUERY_KEYS.lists(),
      });
    },
  });
}

export function useAttemptResult(assessmentId: string, attemptId: string) {
  return useQuery({
    queryKey: ATTEMPT_QUERY_KEYS.result(assessmentId, attemptId),
    queryFn: () => attemptService.getAttemptResult(assessmentId, attemptId),
    enabled: Boolean(assessmentId && attemptId),
    staleTime: 30_000,
  });
}

export function useAssessmentAttempts(
  assessmentId: string,
  params: {
    studentId?: string;
    sectionId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  return useQuery({
    queryKey: ATTEMPT_QUERY_KEYS.list(assessmentId, params),
    queryFn: () => attemptService.listAttempts(assessmentId, params),
    enabled: Boolean(assessmentId),
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
    }) => attemptService.manualGrade(assessmentId, attemptId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ATTEMPT_QUERY_KEYS.result(data.assessmentId, data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ATTEMPT_QUERY_KEYS.lists(),
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
      payload: {
        questionVersionId: string;
        message: string;
        category?: "CLARIFICATION" | "TYPO_REPORT" | "CONTENT_ISSUE" | "GENERAL";
      };
    }) => attemptService.submitQuestionFeedback(assessmentId, payload),
  });
}

export function useStudentResults(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ATTEMPT_QUERY_KEYS.studentResults(params),
    queryFn: () => attemptService.listStudentResults(params),
  });
}

