import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { cloudinary } from "../../config/cloudinary.config.js";
import { env } from "../../config/env.js";
import {
  IStorageProvider,
  UploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
  SignedUploadParams,
  MediaTransformationOptions,
  StorageResourceType,
} from "./storage.types.js";

export class CloudinaryStorageProvider implements IStorageProvider {
  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          resource_type: options.resourceType ?? "auto",
          overwrite: options.overwrite ?? true,
          tags: options.tags ? [...options.tags] : undefined,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error || !result) {
            reject(new Error(error?.message ?? "Cloudinary upload failed"));
            return;
          }

          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            url: result.url,
            format: result.format ?? "",
            resourceType: result.resource_type,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
            originalFilename: result.original_filename,
            etag: result.etag,
            createdAt: result.created_at,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: StorageResourceType = "image"
  ): Promise<StorageDeleteResult> {
    const result = (await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === "auto" ? "image" : resourceType,
    })) as { result: string };

    return {
      result: result.result,
    };
  }

  generateSignedUploadParams(
    folder: string,
    tags?: readonly string[]
  ): SignedUploadParams {
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
      ...(tags && tags.length > 0 ? { tags: tags.join(",") } : {}),
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    const uploadUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`;

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      uploadUrl,
    };
  }

  getOptimizedUrl(
    publicId: string,
    options: MediaTransformationOptions = {}
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: options.format ?? "auto",
      quality: options.quality ?? "auto",
      width: options.width,
      height: options.height,
      crop: options.crop,
      aspect_ratio: options.aspectRatio,
    });
  }
}

export const cloudinaryStorageProvider = new CloudinaryStorageProvider();
