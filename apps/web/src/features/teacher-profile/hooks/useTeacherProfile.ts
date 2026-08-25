import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherProfileService } from "../services/teacher-profile.service";
import {
  CompleteTeacherProfilePayload,
  UpdateTeacherProfilePayload,
} from "../types/teacher-profile.types";

export const TEACHER_PROFILE_QUERY_KEYS = {
  all: ["teacher-profile"] as const,
  me: () => [...TEACHER_PROFILE_QUERY_KEYS.all, "me"] as const,
  details: () => [...TEACHER_PROFILE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...TEACHER_PROFILE_QUERY_KEYS.details(), id] as const,
};

export function useMyTeacherProfile(enabled = true) {
  return useQuery({
    queryKey: TEACHER_PROFILE_QUERY_KEYS.me(),
    queryFn: () => teacherProfileService.getMyProfile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeacherProfile(id: string) {
  return useQuery({
    queryKey: TEACHER_PROFILE_QUERY_KEYS.detail(id),
    queryFn: () => teacherProfileService.getProfileById(id),
    enabled: Boolean(id),
  });
}

export function useCompleteTeacherProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompleteTeacherProfilePayload) =>
      teacherProfileService.completeProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROFILE_QUERY_KEYS.all,
      });
    },
  });
}

export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTeacherProfilePayload) =>
      teacherProfileService.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROFILE_QUERY_KEYS.all,
      });
    },
  });
}
