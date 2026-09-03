import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import {
  ContentImportService,
  contentImportService,
} from "../services/content-import.service.js";
import {
  ContentImportPreviewRequestSchema,
  ContentImportCommitRequestSchema,
} from "../schemas/content-import.schema.js";
import { UnauthorizedError } from "../../../../shared/exceptions/index.js";

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

export class ContentImportController {
  constructor(
    private readonly service: ContentImportService = contentImportService
  ) {}

  previewImport = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const input = ContentImportPreviewRequestSchema.parse(req.body);

      const preview = await this.service.validateAndPreview(
        tenantId,
        input.csvContent,
        input.curriculumVersionId
      );

      res.status(200).json({
        success: true,
        data: preview,
      });
    }
  );

  commitImport = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const input = ContentImportCommitRequestSchema.parse(req.body);

      const result = await this.service.commitImport(
        tenantId,
        userId,
        input
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    }
  );

  getSampleTemplate = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const csv = this.service.getSampleTemplate();

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="learning_content_template.csv"'
      );
      res.status(200).send(csv);
    }
  );
}

export const contentImportController = new ContentImportController();
