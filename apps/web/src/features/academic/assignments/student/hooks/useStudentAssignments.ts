import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentAssignmentService } from "../services/student-assignment.service";
import {
  StudentRosterFilters,
  SingleTransferInput,
  BulkTransferInput,
  PromotionPreviewQuery,
  CommitPromotionInput,
  WithdrawStudentInput,
} from "../types/student-assignment.types";

export const STUDENT_ASSIGNMENT_QUERY_KEYS = {
  all: ["academic-student-assignments"] as const,
  roster: (filters: StudentRosterFilters) =>
    [...STUDENT_ASSIGNMENT_QUERY_KEYS.all, "roster", filters] as const,
  rosterInfinite: (filters: Omit<StudentRosterFilters, "page">) =>
    [...STUDENT_ASSIGNMENT_QUERY_KEYS.all, "roster-infinite", filters] as const,
  sectionsCapacity: (academicYearId: string, gradeLevel: number) =>
    [...STUDENT_ASSIGNMENT_QUERY_KEYS.all, "sections-capacity", academicYearId, gradeLevel] as const,
  promotionPreview: (query: PromotionPreviewQuery) =>
    [...STUDENT_ASSIGNMENT_QUERY_KEYS.all, "promotion-preview", query] as const,
  history: (studentId: string) =>
    [...STUDENT_ASSIGNMENT_QUERY_KEYS.all, "history", studentId] as const,
};

export function useStudentRoster(filters: StudentRosterFilters) {
  return useQuery({
    queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.roster(filters),
    queryFn: () => studentAssignmentService.getRoster(filters),
    enabled: Boolean(filters.academicYearId),
    placeholderData: (previousData) => previousData,
  });
}

export function useInfiniteStudentRoster(filters: Omit<StudentRosterFilters, "page">) {
  return useInfiniteQuery({
    queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.rosterInfinite(filters),
    queryFn: ({ pageParam }) =>
      studentAssignmentService.getRoster({ ...filters, page: pageParam as number, limit: filters.limit ?? 30 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(filters.academicYearId),
  });
}

export function useGradeSectionsCapacity(academicYearId?: string, gradeLevel?: number) {
  return useQuery({
    queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.sectionsCapacity(
      academicYearId || "",
      gradeLevel || 0
    ),
    queryFn: () =>
      studentAssignmentService.getGradeSectionsCapacity(
        academicYearId || "",
        gradeLevel || 0
      ),
    enabled: Boolean(academicYearId && gradeLevel),
  });
}

export function useStudentEnrollmentHistory(studentId: string, enabled = true) {
  return useQuery({
    queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.history(studentId),
    queryFn: () => studentAssignmentService.getStudentEnrollmentHistory(studentId),
    enabled: Boolean(studentId && enabled),
  });
}

export function usePromotionPreview(query: PromotionPreviewQuery, enabled = false) {
  return useQuery({
    queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.promotionPreview(query),
    queryFn: () => studentAssignmentService.getPromotionPreview(query),
    enabled: Boolean(query.sourceAcademicYearId && query.targetAcademicYearId && query.gradeLevel && enabled),
  });
}

export function useTransferStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      academicYearId,
      input,
    }: {
      readonly studentId: string;
      readonly academicYearId: string;
      readonly input: SingleTransferInput;
    }) => studentAssignmentService.transferSingle(studentId, academicYearId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useBulkTransferStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      academicYearId,
      input,
    }: {
      readonly academicYearId: string;
      readonly input: BulkTransferInput;
    }) => studentAssignmentService.transferBulk(academicYearId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useCommitPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CommitPromotionInput) =>
      studentAssignmentService.commitPromotion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useWithdrawStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      academicYearId,
      input,
    }: {
      readonly studentId: string;
      readonly academicYearId: string;
      readonly input: WithdrawStudentInput;
    }) => studentAssignmentService.withdrawStudent(studentId, academicYearId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}
