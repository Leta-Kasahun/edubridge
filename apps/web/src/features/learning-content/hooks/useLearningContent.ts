import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contentService } from "../services/content.service";
import { useAuthStore } from "@/stores/auth.store";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import {
  outboxRepository,
  contentProgressCacheRepository,
  CachedContentProgress,
} from "@/features/offline";
import {
  ContentFilters,
  LearningContentDetailItem,
  ContentVersionItem,
  ContentAttachmentItem,
  CreateLearningContentDto,
  UpdateLearningContentDto,
  UpdateContentMappingsDto,
  CreateContentVersionDto,
  PaginatedContentResponse,
  SaveContentProgressDto,
  StudentContentProgressItem,
  StudentInProgressContentItem,
} from "../types/content.types";

function mapCachedToProgressItem(
  cached: CachedContentProgress
): StudentContentProgressItem {
  return {
    id: cached.id,
    tenantId: cached.tenantId,
    studentId: cached.userId,
    contentId: cached.contentId,
    lastPositionSeconds: cached.lastPositionSeconds,
    durationSeconds: cached.durationSeconds,
    progressPercent: cached.progressPercent,
    isCompleted: cached.isCompleted,
    lastAccessedAt: new Date(cached.updatedAt).toISOString(),
  };
}

export const LEARNING_CONTENT_QUERY_KEY = ["learning-content"] as const;

export function useContentList(filters: ContentFilters = {}) {
  return useQuery<PaginatedContentResponse, Error>({
    queryKey: [...LEARNING_CONTENT_QUERY_KEY, "list", filters],
    queryFn: () => contentService.getContentList(filters),
    staleTime: 30_000,
  });
}

export function useContentDetail(id: string | null) {
  return useQuery<LearningContentDetailItem, Error>({
    queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
    queryFn: () => {
      if (!id) throw new Error("Content ID required");
      return contentService.getContentById(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useContentVersions(id: string | null) {
  return useQuery<readonly ContentVersionItem[], Error>({
    queryKey: [...LEARNING_CONTENT_QUERY_KEY, "versions", id],
    queryFn: () => {
      if (!id) throw new Error("Content ID required");
      return contentService.getVersions(id);
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation<
    LearningContentDetailItem,
    Error,
    CreateLearningContentDto
  >({
    mutationFn: (payload) => contentService.createContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
    },
  });
}

export function useUpdateContentMetadata(id: string) {
  const queryClient = useQueryClient();

  return useMutation<
    LearningContentDetailItem,
    Error,
    UpdateLearningContentDto
  >({
    mutationFn: (payload) => contentService.updateContentMetadata(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useUpdateContentMappings(id: string) {
  const queryClient = useQueryClient();

  return useMutation<
    LearningContentDetailItem,
    Error,
    UpdateContentMappingsDto
  >({
    mutationFn: (payload) => contentService.updateContentMappings(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useSaveNewVersion(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ContentVersionItem, Error, CreateContentVersionDto>({
    mutationFn: (payload) => contentService.saveNewVersion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "versions", id],
      });
    },
  });
}

export function useSubmitContent() {
  const queryClient = useQueryClient();

  return useMutation<LearningContentDetailItem, Error, string>({
    mutationFn: (id) => contentService.submitContent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useApproveContent() {
  const queryClient = useQueryClient();

  return useMutation<LearningContentDetailItem, Error, string>({
    mutationFn: (id) => contentService.approveContent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation<LearningContentDetailItem, Error, string>({
    mutationFn: (id) => contentService.publishContent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useArchiveContent() {
  const queryClient = useQueryClient();

  return useMutation<LearningContentDetailItem, Error, string>({
    mutationFn: (id) => contentService.archiveContent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useActivateContent() {
  const queryClient = useQueryClient();

  return useMutation<LearningContentDetailItem, Error, string>({
    mutationFn: (id) => contentService.activateContent(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) => contentService.deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
    },
  });
}

export function useUploadAttachment(id: string) {
  const queryClient = useQueryClient();

  return useMutation<ContentAttachmentItem, Error, File>({
    mutationFn: (file) => contentService.uploadAttachment(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useUploadContentAttachment() {
  const queryClient = useQueryClient();

  return useMutation<
    ContentAttachmentItem,
    Error,
    { readonly contentId: string; readonly file: File }
  >({
    mutationFn: ({ contentId, file }) =>
      contentService.uploadAttachment(contentId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [
          ...LEARNING_CONTENT_QUERY_KEY,
          "detail",
          variables.contentId,
        ],
      });
    },
  });
}

export function useDeleteAttachment(id: string) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: (attachmentId) =>
      contentService.deleteAttachment(id, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNING_CONTENT_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "detail", id],
      });
    },
  });
}

export function useContentProgress(contentId: string | null) {
  return useQuery<StudentContentProgressItem | null, Error>({
    queryKey: [...LEARNING_CONTENT_QUERY_KEY, "progress", contentId],
    queryFn: async () => {
      if (!contentId) return null;
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const tenantId = useAuthStore.getState().tenantId;
      const userId = useAuthStore.getState().user?.id;

      if (isOffline && tenantId && userId) {
        const cached = await contentProgressCacheRepository.getProgress(
          tenantId,
          userId,
          contentId
        );
        return cached ? mapCachedToProgressItem(cached) : null;
      }

      try {
        const result = await contentService.getProgress(contentId);
        if (result && tenantId && userId) {
          await contentProgressCacheRepository.saveProgressLocal(
            tenantId,
            userId,
            contentId,
            {
              lastPositionSeconds: result.lastPositionSeconds,
              durationSeconds: result.durationSeconds,
              progressPercent: result.progressPercent,
              isCompleted: result.isCompleted,
            }
          );
        }
        return result;
      } catch (err: unknown) {
        if (tenantId && userId) {
          const cached = await contentProgressCacheRepository.getProgress(
            tenantId,
            userId,
            contentId
          );
          if (cached) {
            return mapCachedToProgressItem(cached);
          }
        }
        throw err;
      }
    },
    enabled: Boolean(contentId),
    staleTime: 10_000,
  });
}

export function useSaveContentProgress(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    StudentContentProgressItem,
    Error,
    SaveContentProgressDto
  >({
    mutationFn: async (payload) => {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      const tenantId = useAuthStore.getState().tenantId;
      const userId = useAuthStore.getState().user?.id;

      let localCached: CachedContentProgress | null = null;
      if (tenantId && userId) {
        localCached = await contentProgressCacheRepository.saveProgressLocal(
          tenantId,
          userId,
          contentId,
          payload
        );
      }

      if (isOffline && tenantId && userId && localCached) {
        await outboxRepository.enqueue({
          tenantId,
          userId,
          targetEntityKey: `content_progress:${contentId}`,
          actionType: "SAVE_CONTENT_PROGRESS",
          endpoint: API_ENDPOINTS.LEARNING_CONTENT.PROGRESS(contentId),
          method: "PUT",
          payload: {
            lastPositionSeconds: payload.lastPositionSeconds,
            durationSeconds: payload.durationSeconds,
            progressPercent: payload.progressPercent,
            isCompleted: payload.isCompleted,
          },
          clientTimestamp: Date.now(),
          conflictStrategy: "MONOTONIC_PROGRESS",
          idempotencyKey: `cp:${contentId}:${tenantId}:${userId}:${Date.now()}`,
        });

        return mapCachedToProgressItem(localCached);
      }

      try {
        const result = await contentService.saveProgress(contentId, payload);
        return result;
      } catch (err: unknown) {
        if (tenantId && userId && localCached) {
          await outboxRepository.enqueue({
            tenantId,
            userId,
            targetEntityKey: `content_progress:${contentId}`,
            actionType: "SAVE_CONTENT_PROGRESS",
            endpoint: API_ENDPOINTS.LEARNING_CONTENT.PROGRESS(contentId),
            method: "PUT",
            payload: {
              lastPositionSeconds: payload.lastPositionSeconds,
              durationSeconds: payload.durationSeconds,
              progressPercent: payload.progressPercent,
              isCompleted: payload.isCompleted,
            },
            clientTimestamp: Date.now(),
            conflictStrategy: "MONOTONIC_PROGRESS",
            idempotencyKey: `cp:${contentId}:${tenantId}:${userId}:${Date.now()}`,
          });

          return mapCachedToProgressItem(localCached);
        }
        throw err;
      }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(
        [...LEARNING_CONTENT_QUERY_KEY, "progress", contentId],
        saved
      );
      queryClient.invalidateQueries({
        queryKey: [...LEARNING_CONTENT_QUERY_KEY, "in-progress"],
      });
    },
  });
}

export function useStudentInProgressContent(limit: number = 6) {
  return useQuery<readonly StudentInProgressContentItem[], Error>({
    queryKey: [...LEARNING_CONTENT_QUERY_KEY, "in-progress", limit],
    queryFn: () => contentService.getStudentInProgressContent(limit),
    staleTime: 10_000,
  });
}
