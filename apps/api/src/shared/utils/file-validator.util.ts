import path from "node:path";

export type AllowedMediaCategory =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet";

export interface FileValidationOptions {
  readonly maxSizeBytes?: number;
  readonly allowedCategories?: readonly AllowedMediaCategory[];
}

export interface FileValidationOutcome {
  readonly isValid: boolean;
  readonly category?: AllowedMediaCategory;
  readonly mimeType: string;
  readonly sanitizedFileName: string;
  readonly error?: string;
}

const CATEGORY_MIME_MAP: Readonly<Record<AllowedMediaCategory, readonly string[]>> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a"],
  pdf: ["application/pdf"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/epub+zip",
    "text/plain",
    "text/markdown",
  ],
  spreadsheet: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

const DEFAULT_MAX_SIZE_MAP: Readonly<Record<AllowedMediaCategory, number>> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  pdf: 100 * 1024 * 1024,
  document: 20 * 1024 * 1024,
  spreadsheet: 15 * 1024 * 1024,
};

export function resolveMediaCategory(mimeType: string): AllowedMediaCategory | null {
  const normalized = mimeType.toLowerCase().trim();
  for (const [category, mimes] of Object.entries(CATEGORY_MIME_MAP) as [
    AllowedMediaCategory,
    readonly string[],
  ][]) {
    if (mimes.includes(normalized)) {
      return category;
    }
  }
  return null;
}

export function sanitizeFileName(originalName: string): string {
  const parsed = path.parse(originalName);
  const cleanBase = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const cleanExt = parsed.ext.toLowerCase();
  return `${cleanBase || "file"}${cleanExt}`;
}

export function validateUploadedMedia(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
  options: FileValidationOptions = {}
): FileValidationOutcome {
  const sanitizedFileName = sanitizeFileName(fileName);
  const category = resolveMediaCategory(mimeType);

  if (!category) {
    return {
      isValid: false,
      mimeType,
      sanitizedFileName,
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  if (
    options.allowedCategories &&
    !options.allowedCategories.includes(category)
  ) {
    return {
      isValid: false,
      category,
      mimeType,
      sanitizedFileName,
      error: `File category ${category} is not permitted for this operation`,
    };
  }

  const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_MAP[category];
  if (sizeBytes > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      category,
      mimeType,
      sanitizedFileName,
      error: `File size exceeds ${maxMb}MB limit for ${category} assets`,
    };
  }

  return {
    isValid: true,
    category,
    mimeType,
    sanitizedFileName,
  };
}
