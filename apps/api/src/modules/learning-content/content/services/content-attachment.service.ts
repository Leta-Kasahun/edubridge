import crypto from "node:crypto";
import {
  ContentRepository,
  contentRepository,
} from "../repository/content.repository.js";
import {
  StorageService,
  storageService,
} from "../../../../lib/storage/storage.service.js";
import {
  validateUploadedMedia,
  resolveMediaCategory,
} from "../../../../shared/utils/file-validator.util.js";
import {
  MAX_ATTACHMENT_SIZE_BYTES,
  ALLOWED_ATTACHMENT_CATEGORIES,
} from "../../../../shared/constants/index.js";
import { ContentAttachmentResponse } from "../types/content.types.js";
import { NotFoundError, BadRequestError } from "../../../../shared/exceptions/index.js";

export class ContentAttachmentService {
  constructor(
    private readonly repository: ContentRepository = contentRepository,
    private readonly storage: StorageService = storageService
  ) {}

  resolveDeliveryUrl(storageKey: string, mimeType: string): string {
    const category = resolveMediaCategory(mimeType);
    if (category === "image") {
      return this.storage.getOptimizedDeliveryUrl(storageKey, {
        quality: "auto",
        format: "auto",
      });
    }
    return this.storage.getOptimizedDeliveryUrl(storageKey);
  }

  formatAttachmentResponse(attachment: {
    readonly id: string;
    readonly contentId: string;
    readonly fileName: string;
    readonly mimeType: string;
    readonly storageKey: string;
    readonly sizeBytes: bigint;
    readonly metadata?: unknown;
    readonly uploadedById: string;
    readonly uploadedBy?: {
      readonly firstName: string;
      readonly lastName: string;
    } | null;
    readonly createdAt: Date;
  }): ContentAttachmentResponse {
    return {
      id: attachment.id,
      contentId: attachment.contentId,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      storageKey: attachment.storageKey,
      sizeBytes: attachment.sizeBytes.toString(),
      deliveryUrl: this.resolveDeliveryUrl(
        attachment.storageKey,
        attachment.mimeType
      ),
      metadata:
        attachment.metadata && typeof attachment.metadata === "object"
          ? (attachment.metadata as Record<string, unknown>)
          : null,
      uploadedById: attachment.uploadedById,
      uploaderName: attachment.uploadedBy
        ? `${attachment.uploadedBy.firstName} ${attachment.uploadedBy.lastName}`.trim()
        : undefined,
      createdAt: attachment.createdAt.toISOString(),
    };
  }

  async uploadAttachment(
    tenantId: string,
    contentId: string,
    uploadedById: string,
    file: {
      readonly originalname: string;
      readonly mimetype: string;
      readonly size: number;
      readonly buffer: Buffer;
    }
  ): Promise<ContentAttachmentResponse> {
    const content = await this.repository.findById(tenantId, contentId);
    if (!content) {
      throw new NotFoundError(`Learning content item ${contentId} not found`);
    }

    const validation = validateUploadedMedia(
      file.originalname,
      file.mimetype,
      file.size,
      {
        maxSizeBytes: MAX_ATTACHMENT_SIZE_BYTES,
        allowedCategories: ALLOWED_ATTACHMENT_CATEGORIES,
      }
    );

    if (!validation.isValid) {
      throw new BadRequestError(
        validation.error || "File validation failed"
      );
    }

    const uniqueId = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const folder = this.storage.getContentFolderPath(tenantId, contentId);
    const resourceType = this.storage.resolveResourceType(validation.mimeType);

    const uploadResult = await this.storage.uploadFileBuffer(file.buffer, {
      folder,
      publicId: uniqueId,
      resourceType,
      tags: ["learning-content", tenantId, contentId],
    });

    const attachment = await this.repository.createAttachment(
      tenantId,
      contentId,
      uploadedById,
      {
        fileName: validation.sanitizedFileName,
        mimeType: validation.mimeType,
        storageKey: uploadResult.publicId,
        sizeBytes: BigInt(file.size),
        metadata: {
          format: uploadResult.format,
          resourceType: uploadResult.resourceType,
          originalName: file.originalname,
        },
      }
    );

    return this.formatAttachmentResponse(attachment);
  }

  async deleteAttachment(
    tenantId: string,
    contentId: string,
    attachmentId: string
  ): Promise<{ readonly deleted: boolean; readonly message: string }> {
    const attachment = await this.repository.findAttachmentById(
      tenantId,
      attachmentId
    );

    if (!attachment || attachment.contentId !== contentId) {
      throw new NotFoundError(
        `Attachment ${attachmentId} not found for this content item`
      );
    }

    const isReferencedInPublished =
      await this.repository.isAttachmentReferencedInPublishedVersion(
        tenantId,
        attachmentId
      );

    if (isReferencedInPublished) {
      throw new BadRequestError(
        "This attachment is referenced in one or more published versions and cannot be deleted to preserve historical integrity"
      );
    }

    const resourceType = this.storage.resolveResourceType(attachment.mimeType);
    await this.storage.deleteFile(attachment.storageKey, resourceType);
    await this.repository.deleteAttachmentRecord(tenantId, attachmentId);

    return {
      deleted: true,
      message: "Attachment deleted successfully",
    };
  }

  async getAttachmentsForContent(
    tenantId: string,
    contentId: string
  ): Promise<readonly ContentAttachmentResponse[]> {
    const attachments = await this.repository.findAttachmentsByContentId(
      tenantId,
      contentId
    );
    return attachments.map((att) => this.formatAttachmentResponse(att));
  }
}

export const contentAttachmentService = new ContentAttachmentService();
