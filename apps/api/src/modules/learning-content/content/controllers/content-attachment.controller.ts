import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  ContentAttachmentService,
  contentAttachmentService,
} from "../services/content-attachment.service.js";
import {
  UnauthorizedError,
  BadRequestError,
} from "../../../../shared/exceptions/index.js";

function extractUserContext(req: Request): {
  readonly tenantId: string;
  readonly userId: string;
} {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;

  if (!tenantId) {
    throw new UnauthorizedError("Tenant context required");
  }
  if (!userId) {
    throw new UnauthorizedError("User authentication required");
  }

  return { tenantId, userId };
}

export class ContentAttachmentController {
  constructor(
    private readonly service: ContentAttachmentService = contentAttachmentService
  ) {}

  uploadAttachment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const id = req.params.id as string;

      const file = req.file as
        | (Express.Multer.File & {
            readonly storageKey?: string;
            readonly secureUrl?: string;
          })
        | undefined;

      if (!file) {
        throw new BadRequestError("No file provided for upload");
      }

      const attachment = await this.service.uploadAttachment(
        tenantId,
        id,
        userId,
        {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          storageKey: file.storageKey,
          deliveryUrl: file.secureUrl,
          buffer: file.buffer,
        }
      );

      res.status(201).json({
        success: true,
        data: attachment,
      });
    }
  );

  deleteAttachment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const id = req.params.id as string;
      const attachmentId = req.params.attachmentId as string;

      const result = await this.service.deleteAttachment(
        tenantId,
        id,
        attachmentId
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  getAttachments = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const id = req.params.id as string;

      const attachments = await this.service.getAttachmentsForContent(
        tenantId,
        id
      );

      res.status(200).json({
        success: true,
        data: attachments,
      });
    }
  );

  streamAttachment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const tenantId =
        req.user?.tenantId ||
        (typeof req.query.tenantId === "string" ? req.query.tenantId : undefined);
      const id = req.params.id as string;
      const attachmentId = req.params.attachmentId as string;
      const range = req.headers.range;

      const streamData = await this.service.getAttachmentStream(
        tenantId,
        id,
        attachmentId,
        range
      );

      res.setHeader("Content-Type", streamData.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(streamData.fileName)}"`
      );
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=86400");

      if (streamData.etag) {
        res.setHeader("ETag", `"${streamData.etag}"`);
      }

      if (streamData.contentRange && streamData.contentLength) {
        res.status(206);
        res.setHeader("Content-Range", streamData.contentRange);
        res.setHeader("Content-Length", streamData.contentLength.toString());
      } else if (streamData.contentLength) {
        res.setHeader("Content-Length", streamData.contentLength.toString());
      }

      streamData.stream.pipe(res);
    }
  );
}

export const contentAttachmentController = new ContentAttachmentController();
