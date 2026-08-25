export interface ImageValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export function validateImageFile(
  file: File | null | undefined,
  maxSizeMb = 5
): ImageValidationResult {
  if (!file) {
    return { isValid: false, error: "No file selected" };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: "Invalid image format. Supported formats: JPG, PNG, WEBP",
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMb}MB limit`,
    };
  }

  return { isValid: true };
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreviewUrl(url: string | null | undefined): void {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("File reading error"));
    reader.readAsDataURL(file);
  });
}
