"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherQualificationService } from "../services/teacher-qualification.service";
import {
  CreateQualificationPayload,
  UpdateQualificationPayload,
} from "../types/teacher-qualification.types";

export const TEACHER_QUALIFICATIONS_QUERY_KEY = ["teacher-qualifications"] as const;

export function useMyTeacherQualifications() {
  return useQuery({
    queryKey: TEACHER_QUALIFICATIONS_QUERY_KEY,
    queryFn: () => teacherQualificationService.getMyQualifications(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeacherQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQualificationPayload) =>
      teacherQualificationService.createQualification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUALIFICATIONS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateTeacherQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateQualificationPayload;
    }) => teacherQualificationService.updateQualification(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUALIFICATIONS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteTeacherQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      teacherQualificationService.deleteQualification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUALIFICATIONS_QUERY_KEY,
      });
    },
  });
}
