import { Request, Response } from "express";
import { QuestionUploadService } from "../services/question-upload.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../shared/exceptions/index.js";

const service = new QuestionUploadService();

function getTenantId(req: Request): string {
  const tenantId = req.user?.tenantId || (req.headers["x-tenant-id"] as string);
  if (!tenantId) {
    throw new UnauthorizedError("Tenant context is required");
  }
  return tenantId;
}

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw new UnauthorizedError("User context is required");
  }
  return userId;
}

export class QuestionUploadController {
  upload = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const bankId = req.params.bankId as string;

    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const result = await service.processUpload(
      tenantId,
      bankId,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    res.status(200).json({
      success: true,
      message: "Document processed successfully. Review candidates before confirming.",
      data: result,
    });
  });

  getPreview = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const uploadId = req.params.uploadId as string;

    const result = await service.getPreview(uploadId, tenantId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  confirm = asyncHandler(async (req: Request, res: Response) => {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const bankId = req.params.bankId as string;
    const uploadId = req.params.uploadId as string;
    const { questions } = req.body;

    const result = await service.confirmUpload(
      tenantId,
      bankId,
      userId,
      uploadId,
      questions
    );

    res.status(201).json({
      success: true,
      message: `${result.importedCount} questions imported successfully`,
      data: result,
    });
  });
}
