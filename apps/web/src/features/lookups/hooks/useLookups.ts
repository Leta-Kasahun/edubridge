"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lookupService } from "../services/lookup.service";
import {
  CreateLookupPayload,
  UpdateLookupPayload,
} from "../types/lookup.types";

const LOOKUP_KEYS = {
  all: ["lookups"] as const,
  category: (cat: string) => ["lookups", "category", cat] as const,
  item: (cat: string, key: string) => ["lookups", "category", cat, "key", key] as const,
};

export function useLookupCategory<T = unknown>(
  category: string,
  enabled = true
) {
  return useQuery({
    queryKey: LOOKUP_KEYS.category(category),
    queryFn: () => lookupService.getByCategory<T>(category),
    enabled: Boolean(category) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLookupItem<T = unknown>(
  category: string,
  key: string,
  enabled = true
) {
  return useQuery({
    queryKey: LOOKUP_KEYS.item(category, key),
    queryFn: () => lookupService.getByCategoryAndKey<T>(category, key),
    enabled: Boolean(category) && Boolean(key) && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLookup<T = unknown>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLookupPayload<T>) => lookupService.create<T>(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LOOKUP_KEYS.category(variables.category),
      });
      queryClient.invalidateQueries({
        queryKey: LOOKUP_KEYS.all,
      });
    },
  });
}

export function useUpdateLookup<T = unknown>() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLookupPayload<T> }) =>
      lookupService.update<T>(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LOOKUP_KEYS.all,
      });
    },
  });
}

export function useDeleteLookup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => lookupService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: LOOKUP_KEYS.all,
      });
    },
  });
}
