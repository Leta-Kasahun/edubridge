import {
  QUESTION_UPLOAD_ACCEPTED_EXTENSIONS,
  MAX_QUESTION_FILE_MB,
} from "../constants/question-bank.constants";

export function validateQuestionUploadFile(file: File): { valid: boolean; error?: string } {
  const maxBytes = MAX_QUESTION_FILE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${MAX_QUESTION_FILE_MB}MB.`,
    };
  }

  const acceptedExtensions = QUESTION_UPLOAD_ACCEPTED_EXTENSIONS.split(",").map((ext) =>
    ext.trim().toLowerCase()
  );
  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

  if (!acceptedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Unsupported file type. Accepted formats: ${QUESTION_UPLOAD_ACCEPTED_EXTENSIONS}`,
    };
  }

  return { valid: true };
}

export function formatExtractionStatus(status: string): { label: string; color: string } {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      };
    case "PROCESSING":
      return {
        label: "Processing",
        color: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200 dark:border-sky-800 animate-pulse",
      };
    case "COMPLETED":
      return {
        label: "Extracted",
        color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      };
    case "FAILED":
      return {
        label: "Failed",
        color: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      };
    default:
      return {
        label: status,
        color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      };
  }
}
