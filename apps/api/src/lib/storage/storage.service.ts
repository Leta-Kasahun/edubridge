import {
  IStorageProvider,
  UploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
  SignedUploadParams,
  MediaTransformationOptions,
  StorageResourceType,
} from "./storage.types.js";
import {
  b2StorageProvider,
  B2StorageProvider,
} from "./b2.storage.js";

export class StorageService {
  constructor(
    private readonly provider: IStorageProvider = b2StorageProvider
  ) {}

  resolveResourceType(mimeType: string): StorageResourceType {
    const normalized = mimeType.toLowerCase();
    if (normalized.startsWith("image/")) return "image";
    if (normalized.startsWith("video/") || normalized.startsWith("audio/")) return "video";
    return "raw";
  }

  getContentFolderPath(tenantId: string, contentId: string): string {
    return `edubridge/tenants/${tenantId}/content/${contentId}`;
  }

  getCurriculumFolderPath(tenantId: string, curriculumId: string): string {
    return `edubridge/tenants/${tenantId}/curriculum/${curriculumId}`;
  }

  async uploadFileStream(
    stream: NodeJS.ReadableStream,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    return this.provider.uploadStream(stream, options);
  }

  async uploadFileBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    return this.provider.uploadBuffer(buffer, options);
  }

  async deleteFile(
    publicId: string,
    resourceType?: StorageResourceType
  ): Promise<StorageDeleteResult> {
    return this.provider.deleteFile(publicId, resourceType);
  }

  createSignedUploadParams(
    folder: string,
    tags?: readonly string[]
  ): SignedUploadParams {
    return this.provider.generateSignedUploadParams(folder, tags);
  }

  getOptimizedDeliveryUrl(
    publicId: string,
    options?: MediaTransformationOptions
  ): string {
    return this.provider.getOptimizedUrl(publicId, options);
  }

  async getFileStream(storageKey: string, range?: string) {
    if (this.provider instanceof B2StorageProvider) {
      return this.provider.getFileStream(storageKey, range);
    }
    throw new Error("File streaming is not supported on this storage provider");
  }
}

export const storageService = new StorageService();
export { B2StorageProvider };
