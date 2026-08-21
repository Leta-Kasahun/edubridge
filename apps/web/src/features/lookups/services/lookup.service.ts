import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";
import {
  Lookup,
  CreateLookupPayload,
  UpdateLookupPayload,
} from "../types/lookup.types";

export const lookupService = {
  getByCategory: async <T = unknown>(
    category: string
  ): Promise<readonly Lookup<T>[]> => {
    const response = await apiClient.get<ApiResponse<Lookup<T>[]>>(
      API_ENDPOINTS.LOOKUPS.BY_CATEGORY(category)
    );
    return response.data.data;
  },

  getByCategoryAndKey: async <T = unknown>(
    category: string,
    key: string
  ): Promise<Lookup<T>> => {
    const response = await apiClient.get<ApiResponse<Lookup<T>>>(
      API_ENDPOINTS.LOOKUPS.BY_CATEGORY_KEY(category, key)
    );
    return response.data.data;
  },

  create: async <T = unknown>(
    payload: CreateLookupPayload<T>
  ): Promise<Lookup<T>> => {
    const response = await apiClient.post<ApiResponse<Lookup<T>>>(
      API_ENDPOINTS.LOOKUPS.BASE,
      payload
    );
    return response.data.data;
  },

  update: async <T = unknown>(
    id: string,
    payload: UpdateLookupPayload<T>
  ): Promise<Lookup<T>> => {
    const response = await apiClient.put<ApiResponse<Lookup<T>>>(
      API_ENDPOINTS.LOOKUPS.BY_ID(id),
      payload
    );
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.LOOKUPS.BY_ID(id)
    );
  },
};
