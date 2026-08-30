import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentProfileService } from "../services/student-profile.service";
import {
  CompleteStudentProfilePayload,
  UpdateStudentProfilePayload,
} from "../types/student-profile.types";

export const STUDENT_PROFILE_KEYS = {
  all: ["student-profile"] as const,
  me: () => [...STUDENT_PROFILE_KEYS.all, "me"] as const,
  detail: (id: string) => [...STUDENT_PROFILE_KEYS.all, "detail", id] as const,
};

export function useMyStudentProfile(enabled = true) {
  return useQuery({
    queryKey: STUDENT_PROFILE_KEYS.me(),
    queryFn: () => studentProfileService.getMyProfile(),
    enabled,
  });
}

export function useStudentProfileById(id: string, enabled = true) {
  return useQuery({
    queryKey: STUDENT_PROFILE_KEYS.detail(id),
    queryFn: () => studentProfileService.getProfileById(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCompleteStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompleteStudentProfilePayload) =>
      studentProfileService.completeProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(STUDENT_PROFILE_KEYS.me(), data);
      queryClient.invalidateQueries({ queryKey: STUDENT_PROFILE_KEYS.all });
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProfilePayload) =>
      studentProfileService.updateMyProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(STUDENT_PROFILE_KEYS.me(), data);
      queryClient.invalidateQueries({ queryKey: STUDENT_PROFILE_KEYS.all });
    },
  });
}
