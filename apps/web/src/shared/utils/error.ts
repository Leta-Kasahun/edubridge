import axios from "axios";
import { ApiResponse } from "@/shared/types";

interface ApiErrorBody {
  message?: string;
  errors?: { field?: string; message?: string }[];
  error?: { message?: string };
}

function sanitizeMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes("refresh token") ||
    lower.includes("jwt") ||
    lower.includes("invalid token") ||
    lower.includes("token expired") ||
    lower.includes("token is required") ||
    lower.includes("unauthorized")
  ) {
    return "Your session has expired. Please sign in to continue.";
  }
  if (lower.includes("network error") || lower.includes("failed to fetch")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  if (lower.includes("internal server error") || lower.includes("500")) {
    return "A system error occurred. Please try again in a moment.";
  }
  if (lower.includes("input validation failed") || lower.includes("validation_error")) {
    return "Please check your entries and try again.";
  }
  return msg;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (data?.errors && data.errors.length > 0) {
      const firstError = data.errors[0];
      if (firstError?.message) {
        return sanitizeMessage(firstError.message);
      }
    }

    if (data?.message) return sanitizeMessage(data.message);
    if (data?.error?.message) return sanitizeMessage(data.error.message);

    if (error.response?.status === 401) {
      return "Your session has expired. Please sign in to continue.";
    }

    if (error.message) return sanitizeMessage(error.message);
  }

  if (error instanceof Error) {
    return sanitizeMessage(error.message);
  }

  if (typeof error === "string") {
    return sanitizeMessage(error);
  }

  return fallbackMessage;
}
