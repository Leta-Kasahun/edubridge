import crypto from "node:crypto";
import { Request } from "express";
import multer from "multer";
import {
  StorageService,
  storageService,
} from "../../../../lib/storage/storage.service.js";
import { BadRequestError } from "../../../../shared/exceptions/index.js";

export interface B2MulterFile extends Express.Multer.File {
  storageKey: string;
  secureUrl: string;
}

export class B2MulterStorageEngine implements multer.StorageEngine {
  constructor(private readonly storage: StorageService = storageService) {}

  _handleFile(
    req: Request,
    file: Express.Multer.File,
    cb: (
      error: Error | null,
      info?: Partial<B2MulterFile>
    ) => void
  ): void {
    const tenantId = req.user?.tenantId;
    const contentIdParam = req.params?.id;
    const contentId = Array.isArray(contentIdParam) ? contentIdParam[0] : contentIdParam;

    if (!tenantId || !contentId) {
      cb(new BadRequestError("Missing tenant or content parameters for file upload"));
      return;
    }

    const uniqueId = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const folder = this.storage.getContentFolderPath(tenantId, contentId);
    const resourceType = this.storage.resolveResourceType(file.mimetype);

    this.storage
      .uploadFileStream(file.stream, {
        folder,
        publicId: uniqueId,
        resourceType,
        mimeType: file.mimetype,
        originalFilename: file.originalname,
        tags: ["learning-content", tenantId, contentId],
      })
      .then((result) => {
        cb(null, {
          path: result.secureUrl,
          size: result.bytes,
          filename: uniqueId,
          destination: folder,
          storageKey: result.publicId,
          secureUrl: result.secureUrl,
        });
      })
      .catch((err: unknown) => {
        const error =
          err instanceof Error
            ? err
            : new Error("Backblaze B2 file upload stream failed");
        cb(error);
      });
  }

  _removeFile(
    _req: Request,
    file: Express.Multer.File & { storageKey?: string },
    cb: (error: Error | null) => void
  ): void {
    if (file.storageKey) {
      this.storage
        .deleteFile(file.storageKey)
        .then(() => cb(null))
        .catch((err: unknown) => {
          const error =
            err instanceof Error
              ? err
              : new Error("Backblaze B2 file cleanup failed");
          cb(error);
        });
    } else {
      cb(null);
    }
  }
}

export const createB2MulterStorage = (
  storage: StorageService = storageService
): B2MulterStorageEngine => new B2MulterStorageEngine(storage);
