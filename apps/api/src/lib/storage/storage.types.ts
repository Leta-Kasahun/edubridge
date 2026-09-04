export type StorageResourceType = "image" | "video" | "raw" | "auto";

export type StorageCropMode =
  | "fill"
  | "thumb"
  | "scale"
  | "fit"
  | "limit"
  | "pad";

export interface UploadOptions {
  readonly folder?: string;
  readonly publicId?: string;
  readonly resourceType?: StorageResourceType;
  readonly mimeType?: string;
  readonly originalFilename?: string;
  readonly overwrite?: boolean;
  readonly tags?: readonly string[];
}

export interface StorageUploadResult {
  readonly publicId: string;
  readonly secureUrl: string;
  readonly url: string;
  readonly format: string;
  readonly resourceType: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly duration?: number;
  readonly originalFilename?: string;
  readonly etag?: string;
  readonly createdAt: string;
}

export interface StorageDeleteResult {
  readonly result: string;
}

export interface SignedUploadParams {
  readonly signature: string;
  readonly timestamp: number;
  readonly apiKey: string;
  readonly cloudName: string;
  readonly folder: string;
  readonly uploadUrl: string;
}

export interface MediaTransformationOptions {
  readonly width?: number;
  readonly height?: number;
  readonly crop?: StorageCropMode;
  readonly quality?: "auto" | number | string;
  readonly format?: "auto" | "webp" | "jpg" | "png" | "mp4";
  readonly aspectRatio?: string;
}

export interface IStorageProvider {
  uploadBuffer(
    buffer: Buffer,
    options?: UploadOptions
  ): Promise<StorageUploadResult>;

  uploadStream(
    stream: NodeJS.ReadableStream,
    options?: UploadOptions
  ): Promise<StorageUploadResult>;

  deleteFile(
    publicId: string,
    resourceType?: StorageResourceType
  ): Promise<StorageDeleteResult>;

  generateSignedUploadParams(
    folder: string,
    tags?: readonly string[]
  ): SignedUploadParams;

  getOptimizedUrl(
    publicId: string,
    options?: MediaTransformationOptions
  ): string;
}
