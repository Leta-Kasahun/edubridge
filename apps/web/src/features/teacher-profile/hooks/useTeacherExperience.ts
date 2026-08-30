import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherExperienceService } from "../services/teacher-experience.service";
import {
  TeacherExperience,
  CreateExperiencePayload,
  UpdateExperiencePayload,
} from "../types/teacher-experience.types";

export const TEACHER_EXPERIENCES_QUERY_KEY = ["teacher-experiences"] as const;

export function useMyTeacherExperiences() {
  return useQuery({
    queryKey: TEACHER_EXPERIENCES_QUERY_KEY,
    queryFn: () => teacherExperienceService.getMyExperiences(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTeacherExperience() {
  const queryClient = useQueryClient();

  return useMutation<TeacherExperience, Error, CreateExperiencePayload>({
    mutationFn: (payload) => teacherExperienceService.createExperience(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_EXPERIENCES_QUERY_KEY,
      });
    },
  });
}

export function useUpdateTeacherExperience() {
  const queryClient = useQueryClient();

  return useMutation<
    TeacherExperience,
    Error,
    { id: string; payload: UpdateExperiencePayload }
  >({
    mutationFn: ({ id, payload }) =>
      teacherExperienceService.updateExperience(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_EXPERIENCES_QUERY_KEY,
      });
    },
  });
}

export function useDeleteTeacherExperience() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => teacherExperienceService.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_EXPERIENCES_QUERY_KEY,
      });
    },
  });
}
