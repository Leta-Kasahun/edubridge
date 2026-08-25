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

export function fileToDataUrl(
  file: File,
  maxDimension = 600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image"));
        return;
      }

      img.src = result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => {
        resolve(result);
      };
    };

    reader.onerror = () => reject(reader.error ?? new Error("File reading error"));
    reader.readAsDataURL(file);
  });
}
