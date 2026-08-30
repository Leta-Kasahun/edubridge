export interface DocumentValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
  readonly isPdf: boolean;
  readonly isImage: boolean;
}

export type DocumentType = "pdf" | "image" | "unknown";

const ALLOWED_DOCUMENT_TYPES: readonly string[] = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function validateDocumentFile(
  file: File | null | undefined,
  maxSizeMb = 10
): DocumentValidationResult {
  if (!file) {
    return { isValid: false, error: "No file selected", isPdf: false, isImage: false };
  }

  const mimeType = file.type.toLowerCase();
  const isPdf = mimeType === "application/pdf";
  const isImage = mimeType.startsWith("image/");

  if (!ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: "Invalid document format. Please upload a PDF or an image (JPG, PNG, WEBP).",
      isPdf: false,
      isImage: false,
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMb}MB limit`,
      isPdf,
      isImage,
    };
  }

  return { isValid: true, isPdf, isImage };
}

export function isPdfDocument(urlOrDataUri: string | null | undefined): boolean {
  if (!urlOrDataUri) return false;
  return (
    urlOrDataUri.startsWith("data:application/pdf") ||
    urlOrDataUri.toLowerCase().endsWith(".pdf") ||
    urlOrDataUri.includes("application/pdf")
  );
}

export function isImageDocument(urlOrDataUri: string | null | undefined): boolean {
  if (!urlOrDataUri) return false;
  return (
    urlOrDataUri.startsWith("data:image/") ||
    /\.(jpe?g|png|webp|gif|svg)$/i.test(urlOrDataUri)
  );
}

export function getDocumentType(urlOrDataUri: string | null | undefined): DocumentType {
  if (!urlOrDataUri) return "unknown";
  if (isPdfDocument(urlOrDataUri)) return "pdf";
  if (isImageDocument(urlOrDataUri)) return "image";
  return "unknown";
}

export function fileToDataUrlAsync(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read document as base64 string"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("File reading error"));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function downloadFileFromDataUrl(dataUrl: string, fileName: string): void {
  if (typeof window === "undefined") return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printDocumentFromUrl(url: string): void {
  if (typeof window === "undefined") return;
  const printWindow = window.open(url, "_blank");
  if (printWindow) {
    printWindow.focus();
    printWindow.print();
  }
}
