import { useMutation } from "@tanstack/react-query";
import { contentImportService } from "../services/content-import.service";
import {
  ContentImportPreview,
  ContentImportCommitPayload,
  ContentImportCommitResult,
} from "../types/import.types";

export function usePreviewContentImport() {
  return useMutation<
    ContentImportPreview,
    Error,
    { csvContent: string; curriculumVersionId?: string }
  >({
    mutationFn: (payload) => contentImportService.previewImport(payload),
  });
}

export function useCommitContentImport() {
  return useMutation<
    ContentImportCommitResult,
    Error,
    ContentImportCommitPayload
  >({
    mutationFn: (payload) => contentImportService.commitImport(payload),
  });
}
