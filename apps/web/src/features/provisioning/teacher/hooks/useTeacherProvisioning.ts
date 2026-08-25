import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherProvisioningService } from "../services/teacher-provisioning.service";
import {
  SingleTeacherProvisionInvitePayload,
  SingleTeacherProvisionDirectPayload,
  SingleTeacherProvisionPayload,
  BulkTeacherProvisionPayload,
  BulkTeacherCsvPayload,
  TeacherQueryFilters,
} from "../types/teacher-provisioning.types";

export const TEACHER_PROVISIONING_QUERY_KEYS = {
  all: ["provisioning", "teachers"] as const,
  lists: () => [...TEACHER_PROVISIONING_QUERY_KEYS.all, "list"] as const,
  list: (filters: TeacherQueryFilters) =>
    [...TEACHER_PROVISIONING_QUERY_KEYS.lists(), filters] as const,
  details: () => [...TEACHER_PROVISIONING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...TEACHER_PROVISIONING_QUERY_KEYS.details(), id] as const,
};

export function useTeachers(filters: TeacherQueryFilters = {}) {
  return useQuery({
    queryKey: TEACHER_PROVISIONING_QUERY_KEYS.list(filters),
    queryFn: () => teacherProvisioningService.getTeachers(filters),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: TEACHER_PROVISIONING_QUERY_KEYS.detail(id),
    queryFn: () => teacherProvisioningService.getTeacherById(id),
    enabled: Boolean(id),
  });
}

export function useInviteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SingleTeacherProvisionInvitePayload) =>
      teacherProvisioningService.inviteTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useCreateTeacherDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SingleTeacherProvisionDirectPayload) =>
      teacherProvisioningService.createTeacherDirect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useProvisionTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SingleTeacherProvisionPayload) =>
      teacherProvisioningService.provisionTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useBulkProvisionTeachers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkTeacherProvisionPayload) =>
      teacherProvisioningService.bulkProvisionTeachers(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useBulkProvisionCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkTeacherCsvPayload) =>
      teacherProvisioningService.bulkProvisionCsv(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
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
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
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
        queryKey: TEACHER_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}
