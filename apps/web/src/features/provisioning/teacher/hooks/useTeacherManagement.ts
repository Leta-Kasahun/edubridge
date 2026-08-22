import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherProvisioningService } from "../services/teacher-provisioning.service";
import {
  TeacherQueryFilters,
  UpdateTeacherPayload,
} from "../types/teacher-provisioning.types";

export const TEACHER_QUERY_KEYS = {
  all: ["provisioning", "teachers"] as const,
  list: (filters: TeacherQueryFilters = {}) =>
    ["provisioning", "teachers", "list", filters] as const,
  detail: (id: string) => ["provisioning", "teachers", "detail", id] as const,
};

export function useTeachers(filters: TeacherQueryFilters = {}) {
  return useQuery({
    queryKey: TEACHER_QUERY_KEYS.list(filters),
    queryFn: () => teacherProvisioningService.getTeachers(filters),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: TEACHER_QUERY_KEYS.detail(id),
    queryFn: () => teacherProvisioningService.getTeacherById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeacherPayload }) =>
      teacherProvisioningService.updateTeacher(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUERY_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeactivateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: string }) =>
      teacherProvisioningService.deactivateTeacher(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUERY_KEYS.all,
      });
    },
  });
}

export function useActivateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teacherProvisioningService.activateTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUERY_KEYS.all,
      });
    },
  });
}
