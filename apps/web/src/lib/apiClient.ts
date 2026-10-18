import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiResponse } from "@/shared/types";

const ACCESS_TOKEN_KEY = "access_token";
const EXPIRES_AT_KEY = "token_expires_at";
const TENANT_ID_KEY = "tenant_id";

interface RefreshTokenPayload {
  tokens?: {
    accessToken: string;
    expiresIn?: number;
    tokenType?: string;
  };
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}

export const getAccessToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getTokenExpiresAt = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(EXPIRES_AT_KEY);
  return raw ? Number(raw) : null;
};

export const isTokenExpired = (bufferSeconds = 30): boolean => {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - bufferSeconds * 1000;
};

export const setAuthTokens = (accessToken: string, expiresIn?: number): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  }
};

export const getTenantId = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(TENANT_ID_KEY) : null;

export const setTenantId = (tenantId: string): void => {
  if (typeof window !== "undefined") localStorage.setItem(TENANT_ID_KEY, tenantId);
};

export const clearTenantId = (): void => {
  if (typeof window !== "undefined") localStorage.removeItem(TENANT_ID_KEY);
};

export const clearAuthStorage = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(TENANT_ID_KEY);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((promise) => (error ? promise.reject(error) : promise.resolve(token ?? "")));
  failedQueue = [];
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post<ApiResponse<RefreshTokenPayload>>(
    `${env.apiUrl}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
    {},
    { withCredentials: true }
  );

  const newAccessToken = response.data?.data?.tokens?.accessToken;
  const expiresIn = response.data?.data?.tokens?.expiresIn;

  if (!newAccessToken) {
    throw new Error("Your session has expired. Please sign in to continue.");
  }

  setAuthTokens(newAccessToken, expiresIn);
  return newAccessToken;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    const tenantId = getTenantId();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers["x-tenant-id"] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.FIRST_LOGIN_SETUP)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      const isNetworkOrOffline =
        (typeof navigator !== "undefined" && !navigator.onLine) ||
        (axios.isAxiosError(refreshError) &&
          (!refreshError.response || refreshError.code === "ERR_NETWORK"));

      if (isNetworkOrOffline) {
        const networkErr =
          refreshError instanceof Error ? refreshError : new Error("Network offline");
        processQueue(networkErr, null);
        return Promise.reject(networkErr);
      }

      const err =
        refreshError instanceof Error ? refreshError : new Error("Authentication failed");
      processQueue(err, null);
      clearAuthStorage();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
