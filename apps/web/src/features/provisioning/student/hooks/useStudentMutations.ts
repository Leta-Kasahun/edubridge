import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentProvisioningService } from "../services/student-provisioning.service";
import {
  SingleStudentProvisionPayload,
  BulkStudentCsvPayload,
} from "../types/student-provisioning.types";
import { STUDENT_PROVISIONING_QUERY_KEYS } from "./useAcademicStructure";

export function useCreateGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { level: number }) =>
      studentProvisioningService.createGrade(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      academicYearId: string;
      gradeId: string;
      name: string;
      capacity?: number;
    }) => studentProvisioningService.createSection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useProvisionStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SingleStudentProvisionPayload) =>
      studentProvisioningService.provisionStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useBulkProvisionStudentCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkStudentCsvPayload) =>
      studentProvisioningService.bulkProvisionCsv(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useActivateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentProvisioningService.activateStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}

export function useDeactivateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: string }) =>
      studentProvisioningService.deactivateStudent(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_PROVISIONING_QUERY_KEYS.all,
      });
    },
  });
}
