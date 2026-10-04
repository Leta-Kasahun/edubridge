import { Request, Response } from "express";
import { asyncHandler } from "../../../../shared/utils/async-handler.js";
import { ContentService, contentService } from "../services/content.service.js";
import {
  CreateLearningContentSchema,
  UpdateLearningContentSchema,
  UpdateContentMappingsSchema,
  CreateContentVersionSchema,
  ContentFilterQuerySchema,
  SaveContentProgressSchema,
} from "../schemas/content.schema.js";
import { UnauthorizedError } from "../../../../shared/exceptions/index.js";

function extractUserContext(req: Request): {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: readonly string[];
} {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  const roles = req.user?.roles || [];

  if (!tenantId) {
    throw new UnauthorizedError("Tenant context required");
  }
  if (!userId) {
    throw new UnauthorizedError("User authentication required");
  }

  return { tenantId, userId, roles };
}

export class ContentController {
  constructor(
    private readonly service: ContentService = contentService
  ) {}

  listContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const query = ContentFilterQuerySchema.parse(req.query);

      const result = await this.service.listContent(
        userContext.tenantId,
        query,
        userContext
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    }
  );

  getContentDetail = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const item = await this.service.getContentDetail(
        userContext.tenantId,
        id,
        userContext
      );

      res.status(200).json({
        success: true,
        data: item,
      });
    }
  );

  createContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const input = CreateLearningContentSchema.parse(req.body);

      const created = await this.service.createContent(
        userContext.tenantId,
        userContext.userId,
        input,
        userContext
      );

      res.status(201).json({
        success: true,
        data: created,
      });
    }
  );

  updateMetadata = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;
      const input = UpdateLearningContentSchema.parse(req.body);

      const updated = await this.service.updateContentMetadata(
        userContext.tenantId,
        id,
        input,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  updateMappings = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;
      const input = UpdateContentMappingsSchema.parse(req.body);

      const updated = await this.service.updateContentMappings(
        userContext.tenantId,
        id,
        input,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  saveNewVersion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;
      const input = CreateContentVersionSchema.parse(req.body);

      const newVersion = await this.service.saveNewVersion(
        userContext.tenantId,
        id,
        userContext.userId,
        input,
        userContext
      );

      res.status(201).json({
        success: true,
        data: newVersion,
      });
    }
  );

  getVersions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const id = req.params.id as string;

      const versions = await this.service.getVersions(tenantId, id);

      res.status(200).json({
        success: true,
        data: versions,
      });
    }
  );

  getVersionByNumber = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId } = extractUserContext(req);
      const id = req.params.id as string;
      const versionNumber = req.params.versionNumber as string;

      const version = await this.service.getVersionByNumber(
        tenantId,
        id,
        parseInt(versionNumber, 10)
      );

      res.status(200).json({
        success: true,
        data: version,
      });
    }
  );

  submitForReview = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const updated = await this.service.submitContentForReview(
        userContext.tenantId,
        id,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  approveContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { tenantId, userId } = extractUserContext(req);
      const id = req.params.id as string;

      const updated = await this.service.approveContent(
        tenantId,
        id,
        userId
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  publishContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const updated = await this.service.publishContent(
        userContext.tenantId,
        id,
        userContext.userId,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  archiveContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const updated = await this.service.archiveContent(
        userContext.tenantId,
        id,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  activateContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const updated = await this.service.activateContent(
        userContext.tenantId,
        id,
        userContext.userId,
        userContext
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    }
  );

  deleteContent = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const result = await this.service.deleteContent(
        userContext.tenantId,
        id,
        userContext
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  saveProgress = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;
      const input = SaveContentProgressSchema.parse(req.body);

      const result = await this.service.saveProgress(
        userContext.tenantId,
        userContext.userId,
        userContext.roles,
        id,
        input
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  getProgress = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const id = req.params.id as string;

      const result = await this.service.getProgress(
        userContext.tenantId,
        userContext.userId,
        userContext.roles,
        id
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  listStudentInProgress = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userContext = extractUserContext(req);
      const limit = req.query.limit ? Number(req.query.limit) : 6;

      const items = await this.service.listStudentInProgress(
        userContext.tenantId,
        userContext.userId,
        limit
      );

      res.status(200).json({
        success: true,
        data: items,
      });
    }
  );
}

export const contentController = new ContentController();
