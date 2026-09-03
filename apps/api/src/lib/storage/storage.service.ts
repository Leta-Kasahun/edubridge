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
  cloudinaryStorageProvider,
  CloudinaryStorageProvider,
} from "./cloudinary.storage.js";

export class StorageService {
  constructor(
    private readonly provider: IStorageProvider = cloudinaryStorageProvider
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
}

export const storageService = new StorageService();
export { CloudinaryStorageProvider };
