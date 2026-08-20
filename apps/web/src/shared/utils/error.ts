import axios from "axios";
import { ApiResponse } from "@/shared/types";

export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred"
): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.error?.message) return data.error.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallbackMessage;
}
