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

      const file = req.file;
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
}

export const contentAttachmentController = new ContentAttachmentController();
