import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherAssignmentService } from "../services/teacher-assignment.service";
import {
  TeacherAssignmentFilters,
  CreateTeacherAssignmentInput,
  ReassignTeacherAssignmentInput,
  EndTeacherAssignmentInput,
} from "../types/teacher-assignment.types";

export const TEACHER_ASSIGNMENT_QUERY_KEYS = {
  all: ["academic-teacher-assignments"] as const,
  list: (filters: TeacherAssignmentFilters) =>
    [...TEACHER_ASSIGNMENT_QUERY_KEYS.all, "list", filters] as const,
  loadSummary: (teacherId: string, academicYearId: string) =>
    [...TEACHER_ASSIGNMENT_QUERY_KEYS.all, "load-summary", teacherId, academicYearId] as const,
};

export function useTeacherAssignments(filters: TeacherAssignmentFilters) {
  return useQuery({
    queryKey: TEACHER_ASSIGNMENT_QUERY_KEYS.list(filters),
    queryFn: () => teacherAssignmentService.getAssignments(filters),
    enabled: Boolean(filters.academicYearId || filters.teacherId),
    placeholderData: (previousData) => previousData,
  });
}

export function useTeacherLoadSummary(
  teacherId: string,
  academicYearId: string,
  enabled = true
) {
  return useQuery({
    queryKey: TEACHER_ASSIGNMENT_QUERY_KEYS.loadSummary(teacherId, academicYearId),
    queryFn: () => teacherAssignmentService.getTeacherLoadSummary(teacherId, academicYearId),
    enabled: Boolean(teacherId && academicYearId && enabled),
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTeacherAssignmentInput) =>
      teacherAssignmentService.createAssignment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useReassignTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      input,
    }: {
      readonly assignmentId: string;
      readonly input: ReassignTeacherAssignmentInput;
    }) => teacherAssignmentService.reassignAssignment(assignmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}

export function useEndTeacherAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assignmentId,
      input,
    }: {
      readonly assignmentId: string;
      readonly input: EndTeacherAssignmentInput;
    }) => teacherAssignmentService.endAssignment(assignmentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_ASSIGNMENT_QUERY_KEYS.all });
    },
  });
}
