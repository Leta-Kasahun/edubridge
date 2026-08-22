import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherProvisioningService } from "../services/teacher-provisioning.service";
import {
  SingleTeacherProvisionInvitePayload,
  SingleTeacherProvisionDirectPayload,
  SingleTeacherProvisionPayload,
  BulkTeacherProvisionPayload,
  BulkTeacherCsvPayload,
} from "../types/teacher-provisioning.types";
import { TEACHER_QUERY_KEYS } from "./useTeacherManagement";

export function useInviteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SingleTeacherProvisionInvitePayload) =>
      teacherProvisioningService.inviteTeacher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_QUERY_KEYS.all,
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
        queryKey: TEACHER_QUERY_KEYS.all,
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
        queryKey: TEACHER_QUERY_KEYS.all,
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
        queryKey: TEACHER_QUERY_KEYS.all,
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
        queryKey: TEACHER_QUERY_KEYS.all,
      });
    },
  });
}
