import { Readable, PassThrough } from "node:stream";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
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

function extractRegionFromEndpoint(endpoint: string): string {
  const match = endpoint.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/i);
  return match && match[1] ? match[1] : "";
}

function resolveRegion(): string {
  if (env.B2_REGION && env.B2_REGION.trim()) {
    return env.B2_REGION.trim();
  }
  const extracted = extractRegionFromEndpoint(env.B2_ENDPOINT);
  if (extracted) {
    return extracted;
  }
  return "";
}

function resolveEndpointUrl(endpoint: string, region: string): string {
  const trimmed = endpoint.trim();
  if (trimmed) {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }
  if (region) {
    return `https://s3.${region}.backblazeb2.com`;
  }
  return "";
}

export class B2StorageProvider implements IStorageProvider {
  private client: S3Client | null = null;
  private bucketName = "";
  private publicUrlPrefix = "";
  private endpoint = "";

  private getClient(): S3Client {
    if (!this.client) {
      const region = resolveRegion();
      this.endpoint = resolveEndpointUrl(env.B2_ENDPOINT || process.env.B2_ENDPOINT || "", region);
      this.bucketName = (env.B2_BUCKET_NAME || process.env.B2_BUCKET_NAME || "").trim();
      this.publicUrlPrefix = (env.B2_PUBLIC_URL_PREFIX || process.env.B2_PUBLIC_URL_PREFIX || "").replace(/\/$/, "");

      const keyId = (env.B2_KEY_ID || process.env.B2_KEY_ID || "").trim();
      const appKey = (env.B2_APPLICATION_KEY || process.env.B2_APPLICATION_KEY || "").trim();

      if (!keyId || !appKey) {
        throw new Error("Backblaze B2 credentials missing: B2_KEY_ID or B2_APPLICATION_KEY not configured");
      }

      this.client = new S3Client({
        endpoint: this.endpoint,
        region: region || undefined,
        credentials: {
          accessKeyId: keyId,
          secretAccessKey: appKey,
        },
        forcePathStyle: true,
      });
    }
    return this.client;
  }

  private getBucketName(): string {
    if (!this.bucketName) {
      this.bucketName = (env.B2_BUCKET_NAME || process.env.B2_BUCKET_NAME || "").trim();
    }
    return this.bucketName;
  }

  private getEndpoint(): string {
    if (!this.endpoint) {
      const region = resolveRegion();
      this.endpoint = resolveEndpointUrl(env.B2_ENDPOINT || process.env.B2_ENDPOINT || "", region);
    }
    return this.endpoint;
  }

  private buildKey(folder?: string, publicId?: string): string {
    const segments: string[] = [];
    if (folder) {
      segments.push(folder.replace(/^\/+|\/+$/g, ""));
    }
    if (publicId) {
      segments.push(publicId.replace(/^\/+/, ""));
    }
    return segments.join("/");
  }

  private resolveFileUrl(key: string): string {
    if (this.publicUrlPrefix) {
      return `${this.publicUrlPrefix}/${key}`;
    }
    const cleanEndpoint = this.getEndpoint().replace(/^https?:\/\//, "");
    return `https://${this.getBucketName()}.${cleanEndpoint}/${key}`;
  }

  async uploadStream(
    stream: NodeJS.ReadableStream,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    const key = this.buildKey(options.folder, options.publicId);
    let uploadedBytes = 0;

    const passThrough = new PassThrough();

    stream.on("data", (chunk: Buffer) => {
      uploadedBytes += chunk.length;
    });

    stream.pipe(passThrough);

    const parallelUpload = new Upload({
      client: this.getClient(),
      params: {
        Bucket: this.getBucketName(),
        Key: key,
        Body: passThrough,
        ContentType: options.mimeType || "application/octet-stream",
        Metadata: options.tags && options.tags.length > 0
          ? { tags: options.tags.join(",") }
          : undefined,
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024,
      leavePartsOnError: false,
    });

    try {
      const response = await parallelUpload.done();
      const url = this.resolveFileUrl(key);

      const ext = options.originalFilename
        ? options.originalFilename.split(".").pop() || ""
        : "";

      return {
        publicId: key,
        secureUrl: url,
        url,
        format: ext,
        resourceType: options.resourceType ?? "raw",
        bytes: uploadedBytes,
        originalFilename: options.originalFilename,
        etag: response.ETag?.replace(/"/g, ""),
        createdAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throw error instanceof Error
        ? error
        : new Error("Backblaze B2 upload failed");
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    const readable = Readable.from(buffer);
    return this.uploadStream(readable, options);
  }

  async deleteFile(
    publicId: string,
    _resourceType?: StorageResourceType
  ): Promise<StorageDeleteResult> {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucketName(),
      Key: publicId,
    });

    await this.getClient().send(command);

    return {
      result: "ok",
    };
  }

  generateSignedUploadParams(
    folder: string,
    _tags?: readonly string[]
  ): SignedUploadParams {
    return {
      signature: "",
      timestamp: Math.round(Date.now() / 1000),
      apiKey: (env.B2_KEY_ID || process.env.B2_KEY_ID || "").trim(),
      cloudName: this.getBucketName(),
      folder,
      uploadUrl: this.getEndpoint(),
    };
  }

  getOptimizedUrl(
    publicId: string,
    _options?: MediaTransformationOptions
  ): string {
    return this.resolveFileUrl(publicId);
  }
}

export const b2StorageProvider = new B2StorageProvider();
