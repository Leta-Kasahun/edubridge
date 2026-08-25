import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export interface FileValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
}

export interface SaveImageOptions {
  readonly fileBuffer: Buffer;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly destinationFolder?: string;
  readonly maxSizeMb?: number;
}

export interface SavedFileInfo {
  readonly filename: string;
  readonly relativePath: string;
  readonly fullPath: string;
  readonly size: number;
  readonly mimeType: string;
}

const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MIME_EXTENSION_MAP: Readonly<Record<string, string>> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function validateImageFile(
  fileBuffer: Buffer,
  mimeType: string,
  maxSizeMb = 5
): FileValidationResult {
  if (!fileBuffer || fileBuffer.length === 0) {
    return { isValid: false, error: "File buffer is empty" };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file type. Supported types: JPG, PNG, WEBP`,
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (fileBuffer.length > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMb}MB limit`,
    };
  }

  return { isValid: true };
}

export async function saveUploadedImage({
  fileBuffer,
  originalFilename,
  mimeType,
  destinationFolder = "uploads/profiles",
  maxSizeMb = 5,
}: SaveImageOptions): Promise<SavedFileInfo> {
  const validation = validateImageFile(fileBuffer, mimeType, maxSizeMb);
  if (!validation.isValid) {
    throw new Error(validation.error || "File validation failed");
  }

  const normalizedMime = mimeType.toLowerCase();
  const extension =
    MIME_EXTENSION_MAP[normalizedMime] ||
    path.extname(originalFilename).toLowerCase() ||
    ".jpg";

  const uniqueId = crypto.randomUUID();
  const filename = `${uniqueId}${extension}`;

  const uploadsRoot = path.resolve(process.cwd(), destinationFolder);
  await fs.mkdir(uploadsRoot, { recursive: true });

  const fullPath = path.join(uploadsRoot, filename);
  await fs.writeFile(fullPath, fileBuffer);

  const relativePath = `/${destinationFolder.replace(/^\/+/, "")}/${filename}`;

  return {
    filename,
    relativePath,
    fullPath,
    size: fileBuffer.length,
    mimeType: normalizedMime,
  };
}

export async function deleteUploadedFile(
  filePathOrRelativePath: string
): Promise<boolean> {
  try {
    const fullPath = path.isAbsolute(filePathOrRelativePath)
      ? filePathOrRelativePath
      : path.resolve(
          process.cwd(),
          filePathOrRelativePath.replace(/^\/+/, "")
        );

    await fs.unlink(fullPath);
    return true;
  } catch {
    return false;
  }
}
