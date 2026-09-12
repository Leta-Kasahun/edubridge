import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentService } from "../services/assessment.service";
import {
  AssessmentQueryParams,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
  AssignAssessmentPayload,
} from "../types/assessment.types";

export const ASSESSMENT_QUERY_KEYS = {
  all: ["assessments"] as const,
  lists: () => [...ASSESSMENT_QUERY_KEYS.all, "list"] as const,
  list: (params: AssessmentQueryParams) =>
    [...ASSESSMENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...ASSESSMENT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ASSESSMENT_QUERY_KEYS.details(), id] as const,
};

export function useAssessments(params: AssessmentQueryParams = {}) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.list(params),
    queryFn: () => assessmentService.getAssessments(params),
    staleTime: 30_000,
  });
}

export function useAssessment(id: string) {
  return useQuery({
    queryKey: ASSESSMENT_QUERY_KEYS.detail(id),
    queryFn: () => assessmentService.getAssessmentById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) =>
      assessmentService.createAssessment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAssessmentPayload;
    }) => assessmentService.updateAssessment(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(data.id),
      });
    },
  });
}

export function useSetAssessmentQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      questions,
    }: {
      id: string;
      questions: Array<{
        questionVersionId: string;
        orderIndex: number;
        points: number;
      }>;
    }) => assessmentService.setQuestions(id, questions),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(data.id),
      });
    },
  });
}

export function useAssignAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AssignAssessmentPayload;
    }) => assessmentService.assignToSections(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
}

export function usePublishAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assessmentService.publishAssessment(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_QUERY_KEYS.detail(data.id),
      });
    },
  });
}

export function useArchiveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assessmentService.archiveAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSESSMENT_QUERY_KEYS.lists() });
    },
  });
}
