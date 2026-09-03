import { useMutation, useQueryClient } from "@tanstack/react-query";
import { curriculumImportService } from "../services/import.service";
import {
  CurriculumImportCommitPayload,
  CurriculumImportPreview,
  CurriculumImportCommitResult,
} from "../types/import.types";
import { STRUCTURE_KEYS } from "../../structure/hooks/useStructure";

export const CURRICULUM_IMPORT_QUERY_KEY = ["curriculum-import"] as const;

export function usePreviewCurriculumImport() {
  return useMutation<
    CurriculumImportPreview,
    Error,
    CurriculumImportCommitPayload
  >({
    mutationFn: (payload) => curriculumImportService.previewImport(payload),
  });
}

export function useCommitCurriculumImport() {
  const queryClient = useQueryClient();

  return useMutation<
    CurriculumImportCommitResult,
    Error,
    CurriculumImportCommitPayload
  >({
    mutationFn: (payload) => curriculumImportService.commitImport(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.tree(variables.curriculumVersionId),
      });
      queryClient.invalidateQueries({
        queryKey: STRUCTURE_KEYS.subjects(variables.curriculumVersionId),
      });
    },
  });
}
