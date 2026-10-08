import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masteryService } from "../services/mastery.service";
import {
  SectionMasteryQueryParams,
  RecalculateMasteryPayload,
  RecordPracticeEvidencePayload,
} from "../types/mastery.types";

export const MASTERY_QUERY_KEYS = {
  all: ["mastery"] as const,
  overview: () => [...MASTERY_QUERY_KEYS.all, "overview"] as const,
  sections: () => [...MASTERY_QUERY_KEYS.all, "section"] as const,
  section: (sectionId: string, params?: SectionMasteryQueryParams) =>
    [...MASTERY_QUERY_KEYS.sections(), sectionId, params] as const,
  students: () => [...MASTERY_QUERY_KEYS.all, "student"] as const,
  student: (studentId: string, subjectId?: string) =>
    [...MASTERY_QUERY_KEYS.students(), studentId, subjectId] as const,
  history: (studentId: string, topicId: string) =>
    [...MASTERY_QUERY_KEYS.all, "history", studentId, topicId] as const,
};

export function useMasteryOverview() {
  return useQuery({
    queryKey: MASTERY_QUERY_KEYS.overview(),
    queryFn: () => masteryService.getMasteryOverview(),
    staleTime: 30_000,
  });
}

export function useSectionMastery(
  sectionId: string,
  params?: SectionMasteryQueryParams
) {
  return useQuery({
    queryKey: MASTERY_QUERY_KEYS.section(sectionId, params),
    queryFn: () => masteryService.getSectionMastery(sectionId, params),
    enabled: Boolean(sectionId),
    staleTime: 30_000,
  });
}

export function useStudentMastery(studentId: string, subjectId?: string) {
  return useQuery({
    queryKey: MASTERY_QUERY_KEYS.student(studentId || "me", subjectId),
    queryFn: () => masteryService.getStudentMastery(studentId || "me", subjectId),
    enabled: true,
    staleTime: 30_000,
  });
}

export function useTopicMasteryHistory(
  studentId: string,
  topicId: string,
  enabled = true
) {
  return useQuery({
    queryKey: MASTERY_QUERY_KEYS.history(studentId, topicId),
    queryFn: () => masteryService.getTopicMasteryHistory(studentId, topicId),
    enabled: Boolean(studentId && topicId && enabled),
    staleTime: 60_000,
  });
}

export function useRecalculateMasteryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecalculateMasteryPayload) =>
      masteryService.recalculateMastery(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERY_QUERY_KEYS.all });
    },
  });
}

export function useRecordPracticeEvidenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPracticeEvidencePayload) =>
      masteryService.recordPracticeEvidence(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERY_QUERY_KEYS.all });
    },
  });
}
